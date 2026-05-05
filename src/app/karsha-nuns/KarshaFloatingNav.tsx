'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { GripHorizontal } from 'lucide-react';
import styles from './page.module.css';
import {
  isFloatingNavMobileViewport,
  karshaMobileFloatingNavDefaultTopPx,
  mobileFloatingNavClearanceBelowNavbarPx,
} from '@/utils/floatingNavLayout';

const NAV_LINKS = [
  { name: 'The Documentary', href: '#documentary' },
  { name: 'How it All Began', href: '#history' },
  { name: "Nuns' Visit to Auroville", href: '#visit' },
  { name: 'About the Nunnery', href: '#nunnery' },
  { name: 'Join the Conversation', href: '/discussion?project=karsha-nuns' },
  { name: 'Connect', href: '#connect' },
  { name: 'Donate', href: 'https://pay.auroville.org/aef' },
];

/** Legacy key removed on load so updated defaults apply; current saves use v2. */
const KARSHA_NAV_POSITION_STORAGE_KEY = 'karsha-floating-nav-position-v3';
const LEGACY_KARSHA_NAV_POSITION_KEY_V2 = 'karsha-floating-nav-position-v2';
const LEGACY_KARSHA_NAV_POSITION_KEY_V1 = 'karsha-floating-nav-position';

/** How far above the CMS default users may drag (smaller `top` = higher on screen). */
const DESKTOP_DRAG_MIN_BELOW_DEFAULT_PX = 20;

type KarshaFloatingNavProps = {
  defaultDesktopTopPx: number;
};

export default function KarshaFloatingNav({ defaultDesktopTopPx }: KarshaFloatingNavProps) {
  const [activeHref, setActiveHref] = useState('#documentary');
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [desktopTopDefaultPx, setDesktopTopDefaultPx] = useState(defaultDesktopTopPx);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveSiteDefaultStatus, setSaveSiteDefaultStatus] = useState<string | null>(null);
  const [isSavingSiteDefault, setIsSavingSiteDefault] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setDesktopTopDefaultPx(defaultDesktopTopPx);
  }, [defaultDesktopTopPx]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw) as { role?: string };
        setIsAdmin(user?.role === 'admin');
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (!saveSiteDefaultStatus) {
      return;
    }
    const t = window.setTimeout(() => setSaveSiteDefaultStatus(null), 4500);
    return () => window.clearTimeout(t);
  }, [saveSiteDefaultStatus]);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_KARSHA_NAV_POSITION_KEY_V2);
      window.localStorage.removeItem(LEGACY_KARSHA_NAV_POSITION_KEY_V1);
    } catch {
      // ignore private mode / blocked storage
    }

    const savedPosition = window.localStorage.getItem(KARSHA_NAV_POSITION_STORAGE_KEY);

    const navWidth = navRef.current?.offsetWidth ?? 760;
    const centeredLeft = Math.max(16, Math.round((window.innerWidth - navWidth) / 2));
    const mobileTop = karshaMobileFloatingNavDefaultTopPx();
    const desktopDefaultTop = desktopTopDefaultPx;

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as { left: number; top: number };
        if (Number.isFinite(parsed.left) && Number.isFinite(parsed.top)) {
          if (isFloatingNavMobileViewport() && parsed.top < mobileTop - mobileFloatingNavClearanceBelowNavbarPx() * 0.2) {
            setPosition({ left: centeredLeft, top: mobileTop });
          } else {
            setPosition(parsed);
          }
          return;
        }
      } catch {
        window.localStorage.removeItem(KARSHA_NAV_POSITION_STORAGE_KEY);
      }
    }

    setPosition({
      left: centeredLeft,
      top: isFloatingNavMobileViewport() ? mobileTop : desktopDefaultTop,
    });
  }, [desktopTopDefaultPx]);

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.href.slice(1));

    const updateActiveSection = () => {
      const scrollAnchor = window.scrollY + 180;
      let currentHref = NAV_LINKS[0].href;

      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId);

        if (!section) {
          continue;
        }

        if (section.offsetTop <= scrollAnchor) {
          currentHref = `#${sectionId}`;
        }
      }

      setActiveHref(currentHref);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('hashchange', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('hashchange', updateActiveSection);
    };
  }, []);

  useEffect(() => {
    if (!position) {
      return;
    }

    try {
      window.localStorage.setItem(KARSHA_NAV_POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch {
      // ignore
    }
  }, [position]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const navWidth = navRef.current?.offsetWidth ?? 760;
      const navHeight = navRef.current?.offsetHeight ?? 64;
      const nextLeft = event.clientX - dragOffsetRef.current.x;
      const nextTop = event.clientY - dragOffsetRef.current.y;
      const minTopDesktop = Math.max(12, desktopTopDefaultPx - DESKTOP_DRAG_MIN_BELOW_DEFAULT_PX);
      const minTop = isFloatingNavMobileViewport() ? karshaMobileFloatingNavDefaultTopPx() : minTopDesktop;

      setPosition({
        left: Math.min(Math.max(12, nextLeft), window.innerWidth - navWidth - 12),
        top: Math.min(Math.max(minTop, nextTop), window.innerHeight - navHeight - 12),
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, desktopTopDefaultPx]);

  const handleSaveDesktopDefaultToConfig = async () => {
    if (!isAdmin || !position || isFloatingNavMobileViewport()) {
      return;
    }
    setIsSavingSiteDefault(true);
    setSaveSiteDefaultStatus(null);
    const top = Math.round(position.top);
    try {
      const res = await fetch('/api/cms?type=config', { cache: 'no-store' });
      const current = res.ok ? await res.json() : {};
      const nextConfig = {
        ...current,
        karshaFloatingNav: {
          ...(typeof current?.karshaFloatingNav === 'object' && current.karshaFloatingNav !== null
            ? current.karshaFloatingNav
            : {}),
          desktopTopPx: top,
        },
      };
      const saveRes = await fetch('/api/cms?type=config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      });
      if (!saveRes.ok) {
        throw new Error('save failed');
      }
      setDesktopTopDefaultPx(top);
      setSaveSiteDefaultStatus('Saved as site default');
    } catch {
      setSaveSiteDefaultStatus('Could not save');
    } finally {
      setIsSavingSiteDefault(false);
    }
  };

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
    setActiveHref(href);
  };

  const handleDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!navRef.current) {
      return;
    }

    const rect = navRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };

  const navStyle = position
    ? {
        left: '50%',
        top: `${position.top}px`,
        transform: 'translateX(-50%)',
      }
    : { visibility: 'hidden' as const };

  return (
    <div className={styles.floatingNavWrap} style={navStyle}>
      <div
        ref={navRef}
        className={`${styles.floatingNavInner} ${isDragging ? styles.floatingNavDragging : ''}`}
      >
        <button
          type="button"
          className={styles.navHandle}
          onPointerDown={handleDragStart}
          aria-label="Drag floating section menu"
        >
          <GripHorizontal size={14} />
          <span>Drag</span>
        </button>
        {isAdmin && position && !isFloatingNavMobileViewport() ? (
          <div className={styles.saveNavDefaultWrap}>
            <button
              type="button"
              className={styles.saveNavDefaultBtn}
              disabled={isSavingSiteDefault}
              title="Stores this vertical position in site config for visitors who have not saved their own drag position."
              onClick={() => void handleSaveDesktopDefaultToConfig()}
            >
              {isSavingSiteDefault ? '…' : 'Set default'}
            </button>
            {saveSiteDefaultStatus ? (
              <span className={styles.saveNavDefaultStatus} role="status">
                {saveSiteDefaultStatus}
              </span>
            ) : null}
          </div>
        ) : null}
        <nav className={styles.projectNav} aria-label="Karsha section navigation">
          {NAV_LINKS.map((link) => {
            const isExternal = link.href.startsWith('http');
            const isLocalSection = link.href.startsWith('#');
            const isActive = isLocalSection && activeHref === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? styles.activeNavLink : ''}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => (!isLocalSection ? undefined : handleNavClick(event, link.href))}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}