'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './BreakingPageThemeDock.module.css';
import pageStyles from './page.module.css';

const HEX = /^#([\da-f]{6}|[\da-f]{8})$/i;

function toHex7(hex: string): string {
  if (typeof hex !== 'string' || !HEX.test(hex)) {
    return '#000000';
  }
  return hex.slice(0, 7);
}

function hexToRgb(hex: string) {
  if (!HEX.test(hex)) {
    return null;
  }
  const value = hex.slice(1, 7);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 0;
  }
  const map = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * map(rgb.r) + 0.7152 * map(rgb.g) + 0.0722 * map(rgb.b);
}

export type BreakingPageColors = {
  pageBackground?: string;
  textColor?: string;
  textMutedColor?: string;
  accentTextColor?: string;
  projectHeaderBackground?: string;
  heroBackground?: string;
  mediaWallBackground?: string;
  mediaTileBackground?: string;
  calloutBackground?: string;
  partnerCardBackground?: string;
  contactBoxBackground?: string;
  donateCardBackground?: string;
};

/** Fallback hex for color input when CMS value is empty (design defaults from CSS). */
const INPUT_FALLBACK: Record<keyof BreakingPageColors, string> = {
  pageBackground: '#1b1512',
  textColor: '#f8fafc',
  textMutedColor: '#cbd5e1',
  accentTextColor: '#fbbf24',
  projectHeaderBackground: '#0f172a',
  heroBackground: '#1b1512',
  mediaWallBackground: '#1b1512',
  mediaTileBackground: '#0a0b12',
  calloutBackground: '#0f172a',
  partnerCardBackground: '#533762',
  contactBoxBackground: '#0a0b12',
  donateCardBackground: '#0f172a',
};

const COLOR_FIELDS: Array<{ key: keyof BreakingPageColors; label: string }> = [
  { key: 'pageBackground', label: 'Page' },
  { key: 'textColor', label: 'Text (main)' },
  { key: 'textMutedColor', label: 'Text (muted)' },
  { key: 'accentTextColor', label: 'Accent labels' },
  { key: 'projectHeaderBackground', label: 'Title strip' },
  { key: 'heroBackground', label: 'Hero' },
  { key: 'mediaWallBackground', label: 'Media wall' },
  { key: 'mediaTileBackground', label: 'Media tiles' },
  { key: 'calloutBackground', label: 'Callout' },
  { key: 'partnerCardBackground', label: 'Partner cards' },
  { key: 'contactBoxBackground', label: 'Contact box' },
  { key: 'donateCardBackground', label: 'Donate card' },
];

function mergePageColors(raw: unknown): BreakingPageColors {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const next: BreakingPageColors = {};
  for (const { key } of COLOR_FIELDS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === 'string' && v.trim() && HEX.test(v.trim())) {
      next[key] = v.trim().slice(0, 7);
    }
  }
  return next;
}

function colorsToCssVars(colors: BreakingPageColors): CSSProperties {
  const style: Record<string, string> = {};
  if (colors.pageBackground?.trim()) {
    style['--bts-page-bg'] = colors.pageBackground.trim();
  }
  if (colors.projectHeaderBackground?.trim()) {
    style['--bts-project-header-bg'] = colors.projectHeaderBackground.trim();
  }
  if (colors.heroBackground?.trim()) {
    style['--bts-hero-bg'] = colors.heroBackground.trim();
  }
  if (colors.mediaWallBackground?.trim()) {
    style['--bts-media-wall-bg'] = colors.mediaWallBackground.trim();
  }
  if (colors.mediaTileBackground?.trim()) {
    style['--bts-media-tile-bg'] = colors.mediaTileBackground.trim();
  }
  if (colors.calloutBackground?.trim()) {
    style['--bts-callout-bg'] = colors.calloutBackground.trim();
  }
  if (colors.partnerCardBackground?.trim()) {
    style['--bts-partner-card-bg'] = colors.partnerCardBackground.trim();
  }
  if (colors.contactBoxBackground?.trim()) {
    style['--bts-contact-box-bg'] = colors.contactBoxBackground.trim();
  }
  if (colors.donateCardBackground?.trim()) {
    style['--bts-donate-card-bg'] = colors.donateCardBackground.trim();
  }
  const readabilityBase =
    colors.heroBackground?.trim() || colors.pageBackground?.trim() || INPUT_FALLBACK.pageBackground;
  const isLightBackground = relativeLuminance(toHex7(readabilityBase)) > 0.53;
  const autoForeground = isLightBackground ? '#111827' : '#f8fafc';
  const autoMuted = isLightBackground ? '#334155' : '#cbd5e1';
  const autoAccent = isLightBackground ? '#b45309' : '#fbbf24';
  style['--bts-foreground'] = colors.textColor?.trim() || autoForeground;
  style['--bts-text-muted'] = colors.textMutedColor?.trim() || autoMuted;
  style['--bts-accent-text'] = colors.accentTextColor?.trim() || autoAccent;

  return style as CSSProperties;
}

function sanitizeForSave(colors: BreakingPageColors): BreakingPageColors {
  const out: BreakingPageColors = {};
  for (const { key } of COLOR_FIELDS) {
    const v = colors[key];
    if (typeof v === 'string' && v.trim() && HEX.test(v.trim())) {
      out[key] = v.trim().slice(0, 7);
    }
  }
  return out;
}

async function fetchBreakingPayload(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch('/api/cms?type=breakingTheSilence', { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw) as { role?: string };
        setIsAdmin(user?.role === 'admin');
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  return isAdmin;
}

type BreakingPageThemeDockProps = {
  initialPageColors: unknown;
  initialPayload: Record<string, unknown>;
  children: ReactNode;
};

const DOCK_POSITION_KEY = 'breaking-page-colors-dock-offset';

export default function BreakingPageThemeDock({
  initialPageColors,
  initialPayload,
  children,
}: BreakingPageThemeDockProps) {
  const [colors, setColors] = useState<BreakingPageColors>(() => mergePageColors(initialPageColors));
  const [expanded, setExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dockOffset, setDockOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ pointerId: number; startX: number; startY: number } | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);
  const isAdmin = useAdminStatus();

  const wrapperStyle = useMemo(() => colorsToCssVars(colors), [colors]);

  const clampOffsetToViewport = (offset: { x: number; y: number }) => {
    const dock = dockRef.current;
    if (!dock) {
      return offset;
    }

    const rect = dock.getBoundingClientRect();
    const baseLeft = 16;
    const baseTop = 16;

    const minLeft = 8;
    const maxLeft = Math.max(minLeft, window.innerWidth - rect.width - 8);
    const minTop = 8;
    // If the dock is taller than the viewport, allow extra downward travel so it can still be moved on Y.
    // Allow the dock to travel down even when tall; keep a small reachable strip on screen.
    const maxTop = Math.max(minTop, window.innerHeight - 56);

    const nextLeft = Math.min(Math.max(baseLeft + offset.x, minLeft), maxLeft);
    const nextTop = Math.min(Math.max(baseTop + offset.y, minTop), maxTop);

    return {
      x: nextLeft - baseLeft,
      y: nextTop - baseTop,
    };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DOCK_POSITION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { x?: number; y?: number };
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        setDockOffset(clampOffsetToViewport({ x: parsed.x as number, y: parsed.y as number }));
      }
    } catch {
      // ignore bad local data
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DOCK_POSITION_KEY, JSON.stringify(dockOffset));
    } catch {
      // ignore
    }
  }, [dockOffset]);

  useEffect(() => {
    if (!dragState) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;
      setDockOffset((prev) =>
        clampOffsetToViewport({
          x: prev.x + (event.clientX - dragState.startX),
          y: prev.y + (event.clientY - dragState.startY),
        })
      );
      setDragState({ pointerId: event.pointerId, startX: event.clientX, startY: event.clientY });
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;
      setDragState(null);
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragState]);

  const updateColor = (key: keyof BreakingPageColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setSavedMsg('');
    setErrorMsg('');
  };

  const clearColor = (key: keyof BreakingPageColors) => {
    setColors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSavedMsg('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSavedMsg('');
    try {
      const latest = (await fetchBreakingPayload()) ?? initialPayload;
      const sanitized = sanitizeForSave(colors);
      const payload = { ...latest, pageColors: sanitized };
      const response = await fetch('/api/cms?type=breakingTheSilence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Save failed');
      }
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={pageStyles.wrapper} style={wrapperStyle}>
      {children}
      {isAdmin ? (
        <aside
          ref={dockRef}
          className={styles.dock}
          aria-label="Page background colors (admin)"
          style={{ transform: `translate(${dockOffset.x}px, ${dockOffset.y}px)` }}
          onPointerDown={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('button, input, select, textarea, a')) return;
            setDragState({ pointerId: event.pointerId, startX: event.clientX, startY: event.clientY });
            document.body.style.userSelect = 'none';
          }}
        >
          {expanded ? (
            <div className={styles.dockExpanded}>
              <div className={styles.dockHeader}>
                <h2 className={styles.dockTitle}>Page colors</h2>
                <button type="button" className={styles.toggleBtn} onClick={() => setExpanded(false)}>
                  Hide
                </button>
              </div>
              <p className={styles.hint}>
                Section backgrounds for this project only. Clear uses the default from CSS / site theme. Use Site theme
                (bottom-right on any page) for global nav and page background. Save publishes to CMS.
              </p>
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className={styles.row}>
                  <label htmlFor={`bts-color-${key}`}>{label}</label>
                  <input
                    id={`bts-color-${key}`}
                    className={styles.picker}
                    type="color"
                    value={toHex7(colors[key] || INPUT_FALLBACK[key])}
                    onChange={(e) => updateColor(key, e.target.value)}
                    aria-label={`${label} background`}
                  />
                  <button type="button" className={styles.clearBtn} onClick={() => clearColor(key)}>
                    Clear
                  </button>
                </div>
              ))}
              <div className={styles.actions}>
                <button type="button" className={styles.saveBtn} disabled={saving} onClick={() => void handleSave()}>
                  {saving ? 'Saving…' : 'Save to CMS'}
                </button>
                {savedMsg ? <span className={styles.statusOk}>{savedMsg}</span> : null}
                {errorMsg ? <span className={styles.statusErr}>{errorMsg}</span> : null}
              </div>
            </div>
          ) : (
            <div className={styles.dockCollapsed}>
              <button type="button" className={styles.toggleBtn} onClick={() => setExpanded(true)}>
                Page colors
              </button>
            </div>
          )}
        </aside>
      ) : null}
    </div>
  );
}
