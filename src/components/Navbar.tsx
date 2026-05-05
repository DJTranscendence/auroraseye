'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';
import styles from "./Navbar.module.css";
import { Menu, Settings, House, RotateCcw, ChevronRight, ChevronDown } from "lucide-react";
import YouTubeViewsTicker from './YouTubeViewsTicker';
import { SocialBrandTile } from './SocialBrandTile';
import { trackYouTubeClick } from '@/utils/youtubeAnalytics';
import { AURORAS_THEME_SAVED_EVENT } from '@/config/theme-events';
import {
  DEFAULT_NAVBAR_DRAGGABLE,
  mergeNavbarDraggableFromApi,
  type NavbarDraggableOffsets,
} from '@/config/navbar-draggable-defaults';
import {
  resetNavbarDraggablePublishBridge,
  syncNavbarDraggableForPublish,
} from '@/config/navbar-draggable-publish-bridge';

/** Absolute http(s) or same-site path (not protocol-relative `//`). */
function isSocialHref(url: string) {
  const u = url.trim();
  if (!u) {
    return false;
  }
  if (u.startsWith('http://') || u.startsWith('https://')) {
    return true;
  }
  return u.startsWith('/') && !u.startsWith('//');
}

function resolvedSocialHref(url: string) {
  return isSocialHref(url) ? url.trim() : '#';
}

function isExternalHttpUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://');
}

export default function Navbar() {
  type PreviewMode = 'admin' | 'non-admin';
  type PreviewToggleDragState = {
    pointerId: number;
    offsetX: number;
    offsetY: number;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileProjectsOpen, setIsMobileProjectsOpen] = useState(false);
  const [isDocsMenuOpen, setIsDocsMenuOpen] = useState(false);
  const navOffsetsRef = useRef<NavbarDraggableOffsets>(DEFAULT_NAVBAR_DRAGGABLE);
  const adminConfigRef = useRef<Record<string, unknown> | null>(null);
  const [user, setUser] = useState<any>(null);
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const [adminBaseTheme, setAdminBaseTheme] = useState<ThemePalette | null>(null);
  const [adminHeaderColor, setAdminHeaderColor] = useState('#0a0b12');
  const [adminTextureOverlayOpacity, setAdminTextureOverlayOpacity] = useState(0.14);
  const [adminDarkOverlayOpacity, setAdminDarkOverlayOpacity] = useState(1);
  const [adminHueShift, setAdminHueShift] = useState(0);
  const [themeSaveError, setThemeSaveError] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeSocialUrl, setYoutubeSocialUrl] = useState(
    'https://www.youtube.com/channel/UCprfkWyP0z-RqxZU-UQWcuw',
  );
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/auroras_eye_films/');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/company/auroras-eye-films');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('non-admin');
  const [previewTogglePosition, setPreviewTogglePosition] = useState<{ x: number; y: number } | null>(null);
  const [navbarConfigReady, setNavbarConfigReady] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const docsDropdownRef = useRef<HTMLDivElement | null>(null);
  const previewToggleRef = useRef<HTMLDivElement | null>(null);
  const previewToggleDragRef = useRef<PreviewToggleDragState | null>(null);
  useEffect(() => {
    adminConfigRef.current = adminConfig;
  }, [adminConfig]);
  const router = useRouter();
  const pathname = usePathname();
  const projectNavLinkClass = (base: string, href: string) => {
    const here = pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
    return here ? `${base} ${styles.projectLinkCurrent}` : base;
  };
  const isAdmin = user?.role === 'admin';
  const showAdminView = previewMode === 'admin';
  const canEditNavbarTheme = isAdmin && showAdminView;

  type ThemePalette = {
    headerBackground?: string;
    headerTextureOverlayOpacity?: number;
    headerDarkOverlayOpacity?: number;
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

  type ThemeCssVarKey = Exclude<
    keyof ThemePalette,
    'headerTextureOverlayOpacity' | 'headerDarkOverlayOpacity'
  >;

  const THEME_VAR_MAP: Record<ThemeCssVarKey, string> = {
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
    (Object.keys(THEME_VAR_MAP) as Array<ThemeCssVarKey>).forEach((key) => {
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
    if (!isOpen) {
      setIsMobileProjectsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }

    resetNavbarDraggablePublishBridge();

    fetch(`/api/cms?type=config&t=${Date.now()}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data || typeof data !== 'object' || !data.hero) {
          return;
        }
        setAdminConfig(data);
        const merged = mergeNavbarDraggableFromApi(data?.navbarDraggable);
        navOffsetsRef.current = merged;
        syncNavbarDraggableForPublish(merged);
        if (data?.theme?.headerBackground) {
          setAdminHeaderColor(data.theme.headerBackground);
        }
        if (Number.isFinite(data?.theme?.headerTextureOverlayOpacity)) {
          setAdminTextureOverlayOpacity(Number(data.theme.headerTextureOverlayOpacity));
        }
        if (Number.isFinite(data?.theme?.headerDarkOverlayOpacity)) {
          setAdminDarkOverlayOpacity(Number(data.theme.headerDarkOverlayOpacity));
        }
        if (data?.theme) {
          setAdminBaseTheme(data.theme as ThemePalette);
        }
        if (typeof data?.contact?.facebook === 'string') {
          setFacebookUrl(data.contact.facebook);
        }
        if (data?.contact?.youtube) {
          setYoutubeSocialUrl(data.contact.youtube);
        }
        if (data?.contact?.instagram) {
          setInstagramUrl(data.contact.instagram);
        }
        if (data?.contact?.linkedin) {
          setLinkedinUrl(data.contact.linkedin);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        setNavbarConfigReady(true);
      });
  }, [pathname]);

  useEffect(() => {
    const storedPreviewMode = localStorage.getItem('auroras-navbar-preview-mode');
    if (storedPreviewMode === 'admin' || storedPreviewMode === 'non-admin') {
      setPreviewMode(storedPreviewMode);
      return;
    }
    setPreviewMode(isAdmin ? 'admin' : 'non-admin');
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('auroras-navbar-preview-mode', previewMode);
  }, [previewMode]);

  useEffect(() => {
    const raw = localStorage.getItem('auroras-navbar-preview-toggle-position');
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { x?: number; y?: number };
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        setPreviewTogglePosition({ x: parsed.x as number, y: parsed.y as number });
      }
    } catch {
      /* ignore invalid value */
    }
  }, []);

  useEffect(() => {
    if (!previewTogglePosition) {
      return;
    }
    localStorage.setItem('auroras-navbar-preview-toggle-position', JSON.stringify(previewTogglePosition));
  }, [previewTogglePosition]);

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
    root.style.setProperty('--header-texture-opacity', String(adminTextureOverlayOpacity));
    root.style.setProperty('--header-dark-overlay-opacity', String(adminDarkOverlayOpacity));
  }, [isAdmin, adminBaseTheme, adminHeaderColor, adminHueShift, adminTextureOverlayOpacity, adminDarkOverlayOpacity]);

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
      navOffsetsRef.current = DEFAULT_NAVBAR_DRAGGABLE;
      const cfg = adminConfigRef.current as Record<string, unknown> | null;
      if (!cfg) {
        return;
      }
      const body = { ...cfg, navbarDraggable: DEFAULT_NAVBAR_DRAGGABLE };
      void fetch('/api/cms?type=config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => {
        if (res.ok) {
          setAdminConfig(body);
        }
      });
    };

    window.addEventListener('auroras-reset-navbar-widget-positions', resetWidgetPositions);
    return () => {
      window.removeEventListener('auroras-reset-navbar-widget-positions', resetWidgetPositions);
    };
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (!docsDropdownRef.current?.contains(event.target as Node)) {
        setIsDocsMenuOpen(false);
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

  const handleAdminThemeSave = async (
    nextHeaderColor: string,
    nextHueShift: number,
    nextTextureOverlayOpacity: number,
    nextDarkOverlayOpacity: number,
  ) => {
    if (!isAdmin || !adminConfig || !adminBaseTheme) {
      return;
    }

    const baseTheme = adminBaseTheme;
    const safeColor = (value: string | undefined) => value ?? '#000000';
    const nextTheme = {
      ...baseTheme,
      headerBackground: nextHeaderColor,
      headerTextureOverlayOpacity: nextTextureOverlayOpacity,
      headerDarkOverlayOpacity: nextDarkOverlayOpacity,
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

    const safeNav = mergeNavbarDraggableFromApi(navOffsetsRef.current);
    const nextConfig = {
      ...adminConfig,
      theme: nextTheme,
      navbarDraggable: safeNav,
    };

    const res = await fetch('/api/cms?type=config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; details?: string };
      const msg = body?.details || body?.error || `Save failed (${res.status})`;
      setThemeSaveError(msg);
      console.error('[Navbar theme save]', msg);
      return;
    }
    setThemeSaveError('');
    navOffsetsRef.current = safeNav;
    setAdminConfig(nextConfig);
    setAdminBaseTheme(nextTheme);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AURORAS_THEME_SAVED_EVENT));
    }
  };

  const handlePreviewTogglePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !previewToggleRef.current) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    const rect = previewToggleRef.current.getBoundingClientRect();
    previewToggleDragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    previewToggleRef.current.setPointerCapture(event.pointerId);
  };

  const handlePreviewTogglePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = previewToggleDragRef.current;
    if (!drag || !previewToggleRef.current || drag.pointerId !== event.pointerId) {
      return;
    }

    const rect = previewToggleRef.current.getBoundingClientRect();
    const nextX = event.clientX - drag.offsetX;
    const nextY = event.clientY - drag.offsetY;
    const maxX = Math.max(8, window.innerWidth - rect.width - 8);
    const maxY = Math.max(8, window.innerHeight - rect.height - 8);
    const clampedX = Math.min(Math.max(8, nextX), maxX);
    const clampedY = Math.min(Math.max(8, nextY), maxY);

    setPreviewTogglePosition({ x: clampedX, y: clampedY });
  };

  const handlePreviewTogglePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = previewToggleDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !previewToggleRef.current) {
      return;
    }

    previewToggleRef.current.releasePointerCapture(event.pointerId);
    previewToggleDragRef.current = null;
  };

  /** Layout is CSS-only on desktop so nothing clips under overflow-x; legacy CMS offsets are not applied as transforms. */
  const navClusterPiece = (children: ReactNode, bodyClassName?: string) => (
    <div className={styles.navDragPiece}>
      <div className={[styles.navDragPieceBody, bodyClassName].filter(Boolean).join(' ')}>{children}</div>
    </div>
  );

  return (

    <nav className={`${styles.nav} ${navbarConfigReady ? styles.navReady : styles.navPending}`}>
      {canEditNavbarTheme ? (
        <div className={styles.adminBar}>
          <span>Theme</span>
          {themeSaveError ? (
            <span className={styles.adminBarError} role="alert">
              {themeSaveError}
            </span>
          ) : null}
          <label>
            Header
            <input
              type="color"
              value={adminHeaderColor}
              onChange={(event) => {
                const nextColor = event.target.value;
                setAdminHeaderColor(nextColor);
                void handleAdminThemeSave(nextColor, adminHueShift, adminTextureOverlayOpacity, adminDarkOverlayOpacity);
              }}
            />
          </label>
          <label>
            Texture
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={adminTextureOverlayOpacity}
              onChange={(event) => {
                const nextOpacity = Number(event.target.value);
                setAdminTextureOverlayOpacity(nextOpacity);
                void handleAdminThemeSave(adminHeaderColor, adminHueShift, nextOpacity, adminDarkOverlayOpacity);
              }}
            />
            <span>{adminTextureOverlayOpacity.toFixed(2)}</span>
          </label>
          <label>
            Dark Layer
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={adminDarkOverlayOpacity}
              onChange={(event) => {
                const nextOpacity = Number(event.target.value);
                setAdminDarkOverlayOpacity(nextOpacity);
                void handleAdminThemeSave(adminHeaderColor, adminHueShift, adminTextureOverlayOpacity, nextOpacity);
              }}
            />
            <span>{adminDarkOverlayOpacity.toFixed(2)}</span>
          </label>
          <button
            type="button"
            className={styles.adminBarButton}
            onClick={() => {
              navOffsetsRef.current = DEFAULT_NAVBAR_DRAGGABLE;
              const cfg = adminConfigRef.current as Record<string, unknown> | null;
              if (!cfg) {
                return;
              }
              const body = { ...cfg, navbarDraggable: DEFAULT_NAVBAR_DRAGGABLE };
              void fetch('/api/cms?type=config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              }).then((res) => {
                if (res.ok) {
                  setAdminConfig(body);
                  syncNavbarDraggableForPublish(DEFAULT_NAVBAR_DRAGGABLE);
                }
              });
            }}
          >
            <RotateCcw size={14} aria-hidden />
            Clear legacy CMS offsets (zeros saved layout)
          </button>
        </div>
      ) : null}

      <div className={styles.navScrollInner}>
        <div className={`container ${styles.container}`}>
          {navClusterPiece(
            <Link href="/" className={styles.logo}>
              <Image
                src="/logo-new.png"
                alt="Aurora's Eye"
                width={110}
                height={110}
                className={styles.logoImage}
                priority
                sizes="110px"
              />
            </Link>,
          )}

        <div className={styles.navMenuCluster}>
          <Link
            href="/documentaries"
            className={styles.mobileDocLink}
            onClick={() => setIsOpen(false)}
          >
            Documentaries
          </Link>

          <div className={`${styles.links} ${isOpen ? styles.active : ''}`}>
            <div className={styles.linksDraggableRow}>
              {navClusterPiece(
                <Link href="/" className={styles.homeIconLink} onClick={() => setIsOpen(false)} aria-label="Home">
                  <House size={16} />
                </Link>,
              )}
              {navClusterPiece(
                <>
                  <div
                    ref={docsDropdownRef}
                    className={`${styles.dropdown} ${styles.desktopOnly}`}
                    onMouseEnter={() => setIsDocsMenuOpen(true)}
                  >
                    <span className={styles.dropTrigger}>Documentaries ▾</span>
                    <div className={`${styles.dropdownMenu} ${isDocsMenuOpen ? styles.dropdownMenuOpen : ''}`}>
                      <Link href="/documentaries" onClick={() => { setIsOpen(false); setIsDocsMenuOpen(false); }}>
                        All Documentaries
                      </Link>
                      <div className={styles.submenuContainer}>
                        <div
                          className={styles.submenuTrigger}
                          tabIndex={0}
                          aria-haspopup="true"
                          aria-label="Current projects"
                        >
                          Current Projects{' '}
                          <ChevronRight size={14} className={styles.submenuChevron} aria-hidden />
                        </div>
                        <div className={styles.submenu}>
                          <Link
                            className={projectNavLinkClass(styles.projectLinkBreaking, '/breaking-the-silence')}
                            href="/breaking-the-silence"
                            onClick={() => { setIsOpen(false); setIsDocsMenuOpen(false); }}
                          >
                            Breaking the Silence
                          </Link>
                          <Link
                            className={projectNavLinkClass(styles.projectLinkKarsha, '/karsha-nuns')}
                            href="/karsha-nuns"
                            onClick={() => { setIsOpen(false); setIsDocsMenuOpen(false); }}
                          >
                            Karsha Nuns
                          </Link>
                          <Link
                            className={projectNavLinkClass(styles.projectLinkMatrimandir, '/matrimandir-and-i')}
                            href="/matrimandir-and-i"
                            onClick={() => { setIsOpen(false); setIsDocsMenuOpen(false); }}
                          >
                            Matrimandir &amp; I
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/documentaries" className={styles.mobileOnly} onClick={() => setIsOpen(false)}>
                    Documentaries
                  </Link>
                  <div className={`${styles.mobileOnly} ${styles.mobileProjectsBlock}`}>
                    <div className={styles.submenuContainer}>
                      <button
                        type="button"
                        className={`${styles.submenuTrigger} ${styles.mobileProjectsTrigger}`}
                        aria-expanded={isMobileProjectsOpen}
                        aria-controls="mobile-current-projects"
                        id="mobile-current-projects-trigger"
                        onClick={() => setIsMobileProjectsOpen((prev) => !prev)}
                      >
                        <span className={styles.mobileProjectsTriggerRow}>
                          Current Projects
                          <ChevronDown
                            size={16}
                            strokeWidth={2.25}
                            className={`${styles.mobileProjectsChevron} ${isMobileProjectsOpen ? styles.mobileProjectsChevronOpen : ''}`}
                            aria-hidden
                          />
                        </span>
                      </button>
                      <div
                        id="mobile-current-projects"
                        role="region"
                        aria-labelledby="mobile-current-projects-trigger"
                        className={`${styles.submenu} ${styles.mobileProjectsDropdown} ${isMobileProjectsOpen ? styles.submenuOpen : ''}`}
                      >
                        <Link
                          className={projectNavLinkClass(styles.projectLinkBreaking, '/breaking-the-silence')}
                          href="/breaking-the-silence"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileProjectsOpen(false);
                          }}
                        >
                          Breaking the Silence
                        </Link>
                        <Link
                          className={projectNavLinkClass(styles.projectLinkKarsha, '/karsha-nuns')}
                          href="/karsha-nuns"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileProjectsOpen(false);
                          }}
                        >
                          Karsha Nuns
                        </Link>
                        <Link
                          className={projectNavLinkClass(styles.projectLinkMatrimandir, '/matrimandir-and-i')}
                          href="/matrimandir-and-i"
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileProjectsOpen(false);
                          }}
                        >
                          Matrimandir &amp; I
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {navClusterPiece(<Link href="/team" onClick={() => setIsOpen(false)}>Our Team</Link>)}
              {navClusterPiece(<Link href="/news" onClick={() => setIsOpen(false)}>News</Link>)}
              {navClusterPiece(
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  Contact Us
                </Link>,
              )}
              {navClusterPiece(
                <Link href="/donations" onClick={() => setIsOpen(false)}>
                  Support Us
                </Link>,
              )}
              {!user ? (
                <div className={styles.navAuthExtras}>
                  <Link
                    href="/login"
                    className={`${styles.menuAction} ${styles.mobileOnly}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              ) : null}

              <div className={styles.mobileSocialSection}>
                <p className={styles.mobileSocialLabel}>Follow Us</p>
                <div className={styles.mobileSocialIcons}>
                  <Link
                    className={styles.mobileSocialIconLink}
                    href={resolvedSocialHref(facebookUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialBrandTile brand="facebook" size={24} />
                  </Link>
                  <Link
                    className={styles.mobileSocialIconLink}
                    href={resolvedSocialHref(youtubeSocialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialBrandTile brand="youtube" size={24} />
                  </Link>
                  <Link
                    className={styles.mobileSocialIconLink}
                    href={resolvedSocialHref(linkedinUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialBrandTile brand="linkedin" size={24} />
                  </Link>
                  <Link
                    className={styles.mobileSocialIconLink}
                    href={resolvedSocialHref(instagramUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialBrandTile brand="instagram" size={24} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

          {navClusterPiece(
            <Link href="/donations" className={styles.donateAction} data-role="donate">
              <div className={styles.donateActionBadge}>
                <div className={styles.donateActionIcon} />
                <svg className={`${styles.donateActionRing} ${styles.donateActionRingSpinning}`} viewBox="0 0 200 200">
                  <path id="donate-text-path" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="none" />
                  <text>
                    <textPath href="#donate-text-path">SUPPORT AND DONATE • SUPPORT AND DONATE • </textPath>
                  </text>
                </svg>
              </div>
            </Link>,
            styles.donateActionPiece
          )}

          <div className={styles.actions}>
            {navClusterPiece(
              <div className={styles.navBarTickerWrap}>
                <YouTubeViewsTicker
                  channelUrl={
                    typeof adminConfig?.contact?.youtube === 'string' &&
                    adminConfig.contact.youtube.startsWith('http')
                      ? adminConfig.contact.youtube
                      : undefined
                  }
                />
              </div>,
            )}
            {user?.role === 'admin' ? (
              <Link href="/admin" className={styles.adminNavLink} title="Go to Dashboard">
                <Settings size={18} />
              </Link>
            ) : null}
            <div className={styles.actionsFlexSpacer} style={{ flex: 1 }} />
            <div className={styles.socialDragCluster}>
            {navClusterPiece(<>
                <Link
                  href={resolvedSocialHref(facebookUrl)}
                  {...(isExternalHttpUrl(resolvedSocialHref(facebookUrl))
                    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                    : {})}
                  className={styles.socialBrandTileLink}
                  aria-label="Facebook"
                  data-inactive={!isSocialHref(facebookUrl) ? 'true' : undefined}
                  title={
                    !isSocialHref(facebookUrl)
                      ? 'Add a Facebook URL or local path in Admin → Site settings → Contact & Social'
                      : undefined
                  }
                  onClick={(event) => {
                    if (!isSocialHref(facebookUrl)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <SocialBrandTile brand="facebook" />
                </Link>
                <Link
                  href={resolvedSocialHref(youtubeSocialUrl)}
                  {...(isExternalHttpUrl(resolvedSocialHref(youtubeSocialUrl))
                    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                    : {})}
                  className={styles.socialBrandTileLink}
                  aria-label="YouTube channel"
                  onClick={() => {
                    const href = resolvedSocialHref(youtubeSocialUrl);
                    if (isExternalHttpUrl(href)) {
                      trackYouTubeClick({
                        label: 'YouTube social icon',
                        url: href,
                        location: 'navbar-social',
                      });
                    }
                  }}
                >
                  <SocialBrandTile brand="youtube" />
                </Link>
                <Link
                  href={resolvedSocialHref(linkedinUrl)}
                  {...(isExternalHttpUrl(resolvedSocialHref(linkedinUrl))
                    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                    : {})}
                  className={styles.socialBrandTileLink}
                  aria-label="LinkedIn"
                  data-inactive={!isSocialHref(linkedinUrl) ? 'true' : undefined}
                  onClick={(event) => {
                    if (!isSocialHref(linkedinUrl)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <SocialBrandTile brand="linkedin" />
                </Link>
                <Link
                  href={resolvedSocialHref(instagramUrl)}
                  {...(isExternalHttpUrl(resolvedSocialHref(instagramUrl))
                    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
                    : {})}
                  className={styles.socialBrandTileLink}
                  aria-label="Instagram"
                  data-inactive={!isSocialHref(instagramUrl) ? 'true' : undefined}
                  onClick={(event) => {
                    if (!isSocialHref(instagramUrl)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <SocialBrandTile brand="instagram" />
                </Link>
              </>,
              styles.navDragPieceBodySocialGroup,
            )}
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

      </div>
    </nav>
  );
}
