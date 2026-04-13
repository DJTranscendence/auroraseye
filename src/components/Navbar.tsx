'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';
import styles from "./Navbar.module.css";
import { Youtube, Menu, Settings, LogOut, ChevronDown, House, Instagram, Linkedin, RotateCcw } from "lucide-react";
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';
import YouTubeViewsTicker from './YouTubeViewsTicker';

const DEFAULT_NAV_WIDGET_OFFSETS = { ticker: { x: -49, y: 0 }, donate: { x: 0, y: 0 } };

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDonateRingSpinning, setIsDonateRingSpinning] = useState(false);
  const [navOffsets, setNavOffsets] = useState(DEFAULT_NAV_WIDGET_OFFSETS);
  const [draggingId, setDraggingId] = useState<"ticker" | "donate" | null>(null);
  const [user, setUser] = useState<any>(null);
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [adminBaseTheme, setAdminBaseTheme] = useState<ThemePalette | null>(null);
  const [adminHeaderColor, setAdminHeaderColor] = useState('#0a0b12');
  const [adminHueShift, setAdminHueShift] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/auroras_eye_films/');
  const [linkedinUrl, setLinkedinUrl] = useState('#');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const donateRingRef = useRef<SVGSVGElement | null>(null);
  const donateRingStopTimeoutRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    id: "ticker" | "donate";
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  type ThemePalette = {
    headerBackground?: string;
    background?: string;
    foreground?: string;
    primary?: string;
    primaryGlow?: string;
    surface?: string;
    surfaceMuted?: string;
    textMuted?: string;
    border?: string;
    accent?: string;
  };

  const THEME_VAR_MAP: Record<keyof ThemePalette, string> = {
    headerBackground: '--header-background',
    background: '--background',
    foreground: '--foreground',
    primary: '--primary',
    primaryGlow: '--primary-glow',
    surface: '--surface',
    surfaceMuted: '--surface-muted',
    textMuted: '--text-muted',
    border: '--border',
    accent: '--accent',
  };

  const HEX_COLOR_PATTERN = /^#([\da-f]{6}|[\da-f]{8})$/i;

  const readThemeFromCssVars = () => {
    const styles = getComputedStyle(document.documentElement);
    const theme: ThemePalette = {};
    (Object.keys(THEME_VAR_MAP) as Array<keyof ThemePalette>).forEach((key) => {
      const value = styles.getPropertyValue(THEME_VAR_MAP[key]).trim();
      if (value) {
        theme[key] = value;
      }
    });
    return theme;
  };

  const hexToHsl = (hexColor: string) => {
    const red = Number.parseInt(hexColor.slice(1, 3), 16) / 255;
    const green = Number.parseInt(hexColor.slice(3, 5), 16) / 255;
    const blue = Number.parseInt(hexColor.slice(5, 7), 16) / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;

    let hue = 0;
    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    if (delta !== 0) {
      if (max === red) {
        hue = ((green - blue) / delta) % 6;
      } else if (max === green) {
        hue = (blue - red) / delta + 2;
      } else {
        hue = (red - green) / delta + 4;
      }

      hue *= 60;
      if (hue < 0) {
        hue += 360;
      }
    }

    return { hue, saturation, lightness };
  };

  const hslToHex = (hue: number, saturation: number, lightness: number) => {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const huePrime = hue / 60;
    const secondary = chroma * (1 - Math.abs((huePrime % 2) - 1));

    let red = 0;
    let green = 0;
    let blue = 0;

    if (huePrime >= 0 && huePrime < 1) {
      red = chroma;
      green = secondary;
    } else if (huePrime < 2) {
      red = secondary;
      green = chroma;
    } else if (huePrime < 3) {
      green = chroma;
      blue = secondary;
    } else if (huePrime < 4) {
      green = secondary;
      blue = chroma;
    } else if (huePrime < 5) {
      red = secondary;
      blue = chroma;
    } else {
      red = chroma;
      blue = secondary;
    }

    const match = lightness - chroma / 2;
    const toHex = (value: number) => Math.round((value + match) * 255).toString(16).padStart(2, '0');

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
  };

  const shiftHexHue = (hexColor: string, hueShift: number) => {
    if (!HEX_COLOR_PATTERN.test(hexColor)) {
      return hexColor;
    }

    const baseHex = hexColor.slice(0, 7);
    const alphaHex = hexColor.length === 9 ? hexColor.slice(7, 9) : '';
    const { hue, saturation, lightness } = hexToHsl(baseHex);
    const nextHue = (hue + hueShift + 360) % 360;
    return `${hslToHex(nextHue, saturation, lightness)}${alphaHex}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    fetch(`/api/cms?type=config&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setAdminConfig(data);
        if (data?.theme?.headerBackground) {
          setAdminHeaderColor(data.theme.headerBackground);
        }
        if (data?.theme) {
          setAdminBaseTheme(data.theme as ThemePalette);
        }
        if (data?.contact?.youtube) {
          setYoutubeUrl(data.contact.youtube);
        }
        if (data?.contact?.instagram) {
          setInstagramUrl(data.contact.instagram);
        }
        if (data?.contact?.linkedin) {
          setLinkedinUrl(data.contact.linkedin);
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  useEffect(() => {
    if (!isAdmin || !adminBaseTheme) {
      return;
    }

    const theme = adminBaseTheme;
    const safeColor = (value: string | undefined) => value ?? '#000000';
    const shiftedTheme = {
      ...theme,
      headerBackground: adminHeaderColor,
      background: shiftHexHue(safeColor(theme.background), adminHueShift),
      foreground: shiftHexHue(safeColor(theme.foreground), adminHueShift),
      primary: shiftHexHue(safeColor(theme.primary), adminHueShift),
      primaryGlow: shiftHexHue(safeColor(theme.primaryGlow), adminHueShift),
      surface: shiftHexHue(safeColor(theme.surface), adminHueShift),
      surfaceMuted: shiftHexHue(safeColor(theme.surfaceMuted), adminHueShift),
      textMuted: shiftHexHue(safeColor(theme.textMuted), adminHueShift),
      border: shiftHexHue(safeColor(theme.border), adminHueShift),
      accent: shiftHexHue(safeColor(theme.accent), adminHueShift),
    };

    const root = document.documentElement;
    Object.entries(shiftedTheme).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const cssVar = key === 'headerBackground' ? '--header-background' : `--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
        root.style.setProperty(cssVar, value);
      }
    });
  }, [isAdmin, adminBaseTheme, adminHeaderColor, adminHueShift]);

  useEffect(() => {
    if (!isAdmin || adminBaseTheme) {
      return;
    }

    const cssTheme = readThemeFromCssVars();
    if (Object.keys(cssTheme).length === 0) {
      return;
    }

    setAdminBaseTheme(cssTheme);
    if (cssTheme.headerBackground && adminHeaderColor === '#0a0b12') {
      setAdminHeaderColor(cssTheme.headerBackground);
    }
  }, [isAdmin, adminBaseTheme, adminHeaderColor]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const resetWidgetPositions = () => {
      setNavOffsets(DEFAULT_NAV_WIDGET_OFFSETS);
      window.localStorage.removeItem('navbar-draggable-offsets');
    };

    window.addEventListener('auroras-reset-navbar-widget-positions', resetWidgetPositions);
    return () => {
      window.removeEventListener('auroras-reset-navbar-widget-positions', resetWidgetPositions);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const savedOffsets = window.localStorage.getItem('navbar-draggable-offsets');
    if (!savedOffsets) {
      return;
    }

    try {
      const parsed = JSON.parse(savedOffsets) as typeof navOffsets;
      if (
        parsed?.ticker &&
        parsed?.donate &&
        Number.isFinite(parsed.ticker.x) &&
        Number.isFinite(parsed.ticker.y) &&
        Number.isFinite(parsed.donate.x) &&
        Number.isFinite(parsed.donate.y)
      ) {
        setNavOffsets(parsed);
      }
    } catch {
      window.localStorage.removeItem('navbar-draggable-offsets');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    window.localStorage.setItem('navbar-draggable-offsets', JSON.stringify(navOffsets));
  }, [navOffsets, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const handleAdminThemeSave = async (nextHeaderColor: string, nextHueShift: number) => {
    if (!adminConfig || !adminBaseTheme) {
      return;
    }

    const baseTheme = adminBaseTheme;
    const safeColor = (value: string | undefined) => value ?? '#000000';
    const nextTheme = {
      ...baseTheme,
      headerBackground: nextHeaderColor,
      background: shiftHexHue(safeColor(baseTheme.background), nextHueShift),
      foreground: shiftHexHue(safeColor(baseTheme.foreground), nextHueShift),
      primary: shiftHexHue(safeColor(baseTheme.primary), nextHueShift),
      primaryGlow: shiftHexHue(safeColor(baseTheme.primaryGlow), nextHueShift),
      surface: shiftHexHue(safeColor(baseTheme.surface), nextHueShift),
      surfaceMuted: shiftHexHue(safeColor(baseTheme.surfaceMuted), nextHueShift),
      textMuted: shiftHexHue(safeColor(baseTheme.textMuted), nextHueShift),
      border: shiftHexHue(safeColor(baseTheme.border), nextHueShift),
      accent: shiftHexHue(safeColor(baseTheme.accent), nextHueShift),
    };

    const nextConfig = {
      ...adminConfig,
      theme: nextTheme,
    };

    await fetch('/api/cms?type=config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig),
    });
  };

  useEffect(() => {
    if (!draggingId) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      if (!dragState.moved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
        dragState.moved = true;
      }

      setNavOffsets((prev) => ({
        ...prev,
        [dragState.id]: {
          x: dragState.originX + deltaX,
          y: dragState.originY + deltaY,
        },
      }));
    };

    const handlePointerUp = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      dragStateRef.current = null;
      setDraggingId(null);
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId]);

  const handleDragStart = (id: "ticker" | "donate", event: React.PointerEvent<HTMLDivElement>) => {
    if (!isAdmin) {
      return;
    }

    dragStateRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: navOffsets[id].x,
      originY: navOffsets[id].y,
      moved: false,
    };
    setDraggingId(id);
    document.body.style.userSelect = 'none';
  };

  const getRotationFromMatrix = (matrixValue: string) => {
    if (!matrixValue || matrixValue === 'none') return -30;
    const match = matrixValue.match(/matrix\(([^)]+)\)/);
    if (!match) return -30;
    const values = match[1].split(',').map((value) => Number.parseFloat(value.trim()));
    const [a, b] = values;
    if (Number.isNaN(a) || Number.isNaN(b)) return -30;
    return Math.atan2(b, a) * (180 / Math.PI);
  };

  const handleDonateRingEnter = () => {
    if (donateRingStopTimeoutRef.current !== null) {
      window.clearTimeout(donateRingStopTimeoutRef.current);
      donateRingStopTimeoutRef.current = null;
    }
    const ring = donateRingRef.current;
    if (!ring) return;
    ring.style.transition = '';
    ring.style.transform = '';
    setIsDonateRingSpinning(true);
  };

  const handleDonateRingLeave = () => {
    const ring = donateRingRef.current;
    if (!ring) return;
    const currentRotation = getRotationFromMatrix(getComputedStyle(ring).transform);
    setIsDonateRingSpinning(false);
    ring.style.transition = 'transform 0.65s ease-out';
    ring.style.transform = `rotate(${currentRotation}deg)`;
    ring.getBoundingClientRect();
    ring.style.transform = `rotate(${currentRotation + 24}deg)`;
    donateRingStopTimeoutRef.current = window.setTimeout(() => {
      ring.style.transition = '';
      donateRingStopTimeoutRef.current = null;
    }, 700);
  };


  return (

    <nav className={styles.nav}>
      {isAdmin ? (
        <div className={styles.adminBar}>
          <span>Theme</span>
          <label>
            Header
            <input
              type="color"
              value={adminHeaderColor}
              onChange={(event) => {
                const nextColor = event.target.value;
                setAdminHeaderColor(nextColor);
                void handleAdminThemeSave(nextColor, adminHueShift);
              }}
            />
          </label>
          <button
            type="button"
            className={styles.adminBarButton}
            onClick={() => {
              setNavOffsets(DEFAULT_NAV_WIDGET_OFFSETS);
              window.localStorage.removeItem('navbar-draggable-offsets');
            }}
          >
            <RotateCcw size={14} aria-hidden />
            Reset ticker / donate positions
          </button>
        </div>
      ) : null}

      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo-new.png" 
            alt="Aurora's Eye" 
            width={110} 
            height={110} 
            className={styles.logoImage}
          />

        </Link>

        <Link
          href="/documentaries"
          className={styles.mobileDocLink}
          onClick={() => setIsOpen(false)}
        >
          Documentaries
        </Link>

        <div className={`${styles.links} ${isOpen ? styles.active : ''}`}>
          <Link
            href="/"
            className={styles.homeIconLink}
            onClick={() => setIsOpen(false)}
            aria-label="Home"
          >
            <House size={16} />
          </Link>

          <div className={styles.dropdown}>
            <span className={styles.dropTrigger}>Documentaries ▾</span>
            <div className={styles.dropdownMenu}>
              <Link href="/documentaries" onClick={() => setIsOpen(false)}>All Documentaries</Link>
              <div className={styles.dropdownSection}>
                <span className={styles.dropdownSectionLabel}>Current Projects</span>
                <div className={styles.dropdownSectionList}>
                  <Link href="/breaking-the-silence" onClick={() => setIsOpen(false)}>Breaking the Silence</Link>
                  <Link href="/karsha-nuns" onClick={() => setIsOpen(false)}>Karsha Nuns</Link>
                  <Link href="/matrimandir-and-i" onClick={() => setIsOpen(false)}>Matrimandir &amp; I</Link>
                </div>
              </div>
            </div>
          </div>

          <Link href="/team" onClick={() => setIsOpen(false)}>Our Team</Link>
          <Link href="/news" onClick={() => setIsOpen(false)}>News</Link>
          <Link href="/donations" className={styles.mobileOnly} onClick={() => setIsOpen(false)}>Donate</Link>
          {user ? (
            <button
              type="button"
              className={styles.menuAction}
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className={`${styles.menuAction} ${styles.mobileOnly}`}
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
          <Link
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.youtubeAction}
            onClick={() =>
              trackYouTubeClick({
                label: 'Navbar watch CTA',
                url: youtubeUrl,
                location: 'navbar-action',
              })
            }
          >
            <Youtube size={18} />
          </Link>
        </div>

        <div className={styles.actions}>
          <div
            className={`${styles.draggableItem} ${isAdmin ? styles.draggableAdmin : ''} ${draggingId === 'ticker' ? styles.draggableActive : ''}`}
            style={{ transform: `translate(${navOffsets.ticker.x}px, ${navOffsets.ticker.y}px)` }}
            onPointerDown={(event) => handleDragStart('ticker', event)}
          >
            <YouTubeViewsTicker />
          </div>
          {user?.role === 'admin' ? (
            <Link href="/admin" className={styles.adminNavLink} title="Go to Dashboard">
              <Settings size={18} />
            </Link>
          ) : null}
          <div
            className={`${styles.draggableItem} ${isAdmin ? styles.draggableAdmin : ''} ${draggingId === 'donate' ? styles.draggableActive : ''}`}
            data-role="donate"
            style={{ transform: `translate(${navOffsets.donate.x}px, ${navOffsets.donate.y}px)` }}
            onPointerDown={(event) => handleDragStart('donate', event)}
          >
            <Link
              href="/donations"
              className={styles.donateAction}
              aria-label="Support and Donate"
              onMouseEnter={handleDonateRingEnter}
              onMouseLeave={handleDonateRingLeave}
              onClick={(event) => {
                if (dragStateRef.current?.moved) {
                  event.preventDefault();
                }
              }}
            >
              <span className={styles.donateActionBadge}>
                <span className={styles.donateActionIcon} aria-hidden="true" />
                <svg
                  ref={donateRingRef}
                  className={`${styles.donateActionRing} ${isDonateRingSpinning ? styles.donateActionRingSpinning : ''}`}
                  viewBox="0 0 200 200"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="donateActionCirclePath"
                      d="M 100, 100 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
                    />
                  </defs>
                  <text>
                    <textPath href="#donateActionCirclePath">SUPPORT AND DONATE</textPath>
                  </text>
                </svg>
              </span>
            </Link>
          </div>
          <div className={styles.socialLinks} aria-label="Social links">
            <Link href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </Link>
            <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </Link>
          </div>
          <div
            className={styles.menuToggle}
            onPointerDown={(event) => {
              event.stopPropagation();
              setIsOpen((current) => !current);
            }}
          >
            <Menu size={24} />
          </div>
        </div>

      </div>
    </nav>
  );
}

