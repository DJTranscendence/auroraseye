'use client';

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Hand, Heart } from "lucide-react";
import styles from "./page.module.css";
import {
  gapTwoMmPx,
  isFloatingNavMobileViewport,
  mobileFloatingNavClearanceBelowNavbarPx,
  mobileFloatingNavDefaultTopPx,
  readCssLengthPx,
} from "@/utils/floatingNavLayout";

const NAV_LINKS = [
  { href: "#documentary" as const },
  { href: "#why" },
  { href: "#conversation", icon: "heart" as const },
  { href: "#connect" },
  { href: "#donate" },
];
const DEFAULT_LABELS = [
  "The Documentary",
  "Why This Film Matters",
  "Join the Conversation",
  "Connect",
  "Donate",
];
const BREAKING_FLOATING_NAV_POSITION_KEY = "breaking-floating-nav-position-v4";

export default function BreakingFloatingNav({ labelSlots }: { labelSlots: ReactNode[] }) {
  const [activeHref, setActiveHref] = useState("#documentary");
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const desktopFloatingNavDefaultTopPx = () =>
    readCssLengthPx("--nav-height", 80) + mobileFloatingNavClearanceBelowNavbarPx() - (2 * 96) / 25.4 + gapTwoMmPx() * 0.5 + (96 / 2.54);

  useEffect(() => {
    const savedPosition = window.localStorage.getItem(BREAKING_FLOATING_NAV_POSITION_KEY);

    const navWidth = navRef.current?.offsetWidth ?? 760;
    const centeredLeft = Math.max(16, Math.round((window.innerWidth - navWidth) / 2));
    const mobileTop = mobileFloatingNavDefaultTopPx();
    const desktopDefaultTop = desktopFloatingNavDefaultTopPx();

    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as { left: number; top: number };
        if (Number.isFinite(parsed.left) && Number.isFinite(parsed.top)) {
          const minTop = isFloatingNavMobileViewport() ? mobileTop : desktopDefaultTop;
          if (parsed.top < minTop) {
            setPosition({ left: centeredLeft, top: minTop });
          } else {
            setPosition(parsed);
          }
          return;
        }
      } catch {
        window.localStorage.removeItem(BREAKING_FLOATING_NAV_POSITION_KEY);
      }
    }

    setPosition({
      left: centeredLeft,
      top: isFloatingNavMobileViewport() ? mobileTop : desktopDefaultTop,
    });
  }, []);

  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.href.slice(1));

    const updateActiveSection = () => {
      const scrollAnchor = window.scrollY + 180;
      let currentHref = NAV_LINKS[0]?.href ?? "#documentary";

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
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("hashchange", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    if (!position) {
      return;
    }

    window.localStorage.setItem(BREAKING_FLOATING_NAV_POSITION_KEY, JSON.stringify(position));
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
      const minTop = isFloatingNavMobileViewport()
        ? mobileFloatingNavDefaultTopPx()
        : desktopFloatingNavDefaultTopPx();

      setPosition({
        left: Math.min(Math.max(12, nextLeft), window.innerWidth - navWidth - 12),
        top: Math.min(Math.max(minTop, nextTop), window.innerHeight - navHeight - 12),
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
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
    document.body.style.userSelect = "none";
  };

  const navStyle = position
    ? {
        left: "50%",
        top: `${position.top}px`,
        transform: "translateX(-50%)",
      }
    : { visibility: "hidden" as const };

  return (
    <div className={styles.floatingNavWrap} style={navStyle}>
      <div
        ref={navRef}
        className={`${styles.floatingNavInner} ${isDragging ? styles.floatingNavDragging : ""}`}
      >
        <nav className={styles.projectNav} aria-label="Breaking the Silence section navigation">
          {NAV_LINKS.map((link, index) => {
            const isExternal = link.href.startsWith("http");
            const isActive = !isExternal && activeHref === link.href;
            const label = labelSlots[index] ?? DEFAULT_LABELS[index] ?? "";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? styles.activeNavLink : ""}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => (isExternal ? undefined : handleNavClick(event, link.href))}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {link.icon === "heart" ? <Heart size={14} fill="currentColor" /> : null}
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className={styles.navHandle}
          onPointerDown={handleDragStart}
          aria-label="Drag floating section menu"
        >
          <Hand size={14} />
        </button>
      </div>
    </div>
  );
}
