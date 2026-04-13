'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './AdminGlobalThemeDock.module.css';

const HEX = /^#([\da-f]{6}|[\da-f]{8})$/i;

function toHex7(hex: string): string {
  if (typeof hex !== 'string' || !HEX.test(hex)) {
    return '#000000';
  }
  return hex.slice(0, 7);
}

const THEME_VAR_MAP = {
  headerBackground: '--header-background',
  background: '--background',
  foreground: '--foreground',
  primary: '--primary',
  surface: '--surface',
  surfaceMuted: '--surface-muted',
  textMuted: '--text-muted',
  border: '--border',
  accent: '--accent',
} as const;

type ThemeColorKey = keyof typeof THEME_VAR_MAP;

type FullTheme = Record<string, string | undefined>;

const PICKER_FIELDS: Array<{ key: ThemeColorKey; label: string }> = [
  { key: 'headerBackground', label: 'Header (nav)' },
  { key: 'background', label: 'Page background' },
  { key: 'foreground', label: 'Text' },
  { key: 'textMuted', label: 'Muted text' },
  { key: 'surface', label: 'Surface' },
  { key: 'surfaceMuted', label: 'Surface muted' },
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'border', label: 'Border' },
];

const INPUT_FALLBACK: Record<ThemeColorKey, string> = {
  headerBackground: '#0a0b12',
  background: '#1b1512',
  foreground: '#f5efe7',
  textMuted: '#ceb8a8',
  surface: '#2c221c',
  surfaceMuted: '#3a2c23',
  primary: '#9a6446',
  accent: '#42c5c0',
  border: '#6e5345',
};
const DOCK_POSITION_KEY = 'site-theme-dock-offset';

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

function pickThemeFromConfig(data: unknown): FullTheme {
  if (!data || typeof data !== 'object' || !('theme' in data)) {
    return {};
  }
  const theme = (data as { theme?: unknown }).theme;
  if (!theme || typeof theme !== 'object') {
    return {};
  }
  return theme as FullTheme;
}

export default function AdminGlobalThemeDock() {
  const isAdmin = useAdminStatus();
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState<FullTheme>({});
  const [primaryGlow, setPrimaryGlow] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [dockOffset, setDockOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ pointerId: number; startX: number; startY: number } | null>(null);
  const baselineRef = useRef<FullTheme | null>(null);
  const baselineGlowRef = useRef<string>('');

  const applyToDocument = useCallback((nextTheme: FullTheme, glow: string) => {
    const root = document.documentElement;
    (Object.keys(THEME_VAR_MAP) as ThemeColorKey[]).forEach((key) => {
      const v = nextTheme[key];
      const cssVar = THEME_VAR_MAP[key];
      if (typeof v === 'string' && v.trim()) {
        root.style.setProperty(cssVar, v.trim());
      } else {
        root.style.removeProperty(cssVar);
      }
    });
    if (glow.trim()) {
      root.style.setProperty('--primary-glow', glow.trim());
    } else {
      root.style.removeProperty('--primary-glow');
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || !loaded) {
      return;
    }
    applyToDocument(theme, primaryGlow);
  }, [isAdmin, loaded, theme, primaryGlow, applyToDocument]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms?type=config', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Could not load config');
      }
      const data = (await response.json()) as Record<string, unknown>;
      const t = pickThemeFromConfig(data);
      const glow = typeof t.primaryGlow === 'string' ? t.primaryGlow : '';
      baselineGlowRef.current = glow;
      const { primaryGlow: _omit, ...colorTheme } = t;
      void _omit;
      baselineRef.current = { ...t };
      setTheme(colorTheme);
      setPrimaryGlow(glow);
      setLoaded(true);
      setErrorMsg('');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || !expanded || loaded) {
      return;
    }
    void loadConfig();
  }, [isAdmin, expanded, loaded, loadConfig]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DOCK_POSITION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { x?: number; y?: number };
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        setDockOffset({ x: parsed.x as number, y: parsed.y as number });
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
      setDockOffset((prev) => ({
        x: prev.x + (event.clientX - dragState.startX),
        y: prev.y + (event.clientY - dragState.startY),
      }));
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

  const updateColor = (key: ThemeColorKey, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setSavedMsg('');
    setErrorMsg('');
  };

  const clearColor = (key: ThemeColorKey) => {
    const base = baselineRef.current?.[key];
    setTheme((prev) => ({ ...prev, [key]: typeof base === 'string' ? base : '' }));
    setSavedMsg('');
    setErrorMsg('');
  };

  const clearPrimaryGlow = () => {
    setPrimaryGlow(baselineGlowRef.current);
    setSavedMsg('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    if (!loaded) {
      return;
    }
    setSaving(true);
    setErrorMsg('');
    setSavedMsg('');
    try {
      const latestRes = await fetch('/api/cms?type=config', { cache: 'no-store' });
      if (!latestRes.ok) {
        throw new Error('Could not load config to save');
      }
      const latest = (await latestRes.json()) as Record<string, unknown>;
      const prevTheme = (latest.theme && typeof latest.theme === 'object' ? latest.theme : {}) as Record<
        string,
        string
      >;
      const nextTheme = {
        ...prevTheme,
        ...theme,
        primaryGlow: primaryGlow.trim() || prevTheme.primaryGlow || '',
      };
      const payload = { ...latest, theme: nextTheme };
      const response = await fetch('/api/cms?type=config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
      if (!response.ok) {
        throw new Error(body?.details || body?.error || 'Save failed');
      }
      baselineRef.current = { ...nextTheme };
      baselineGlowRef.current = typeof nextTheme.primaryGlow === 'string' ? nextTheme.primaryGlow : '';
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <aside
      className={styles.dock}
      aria-label="Site theme colors (admin)"
      style={{ transform: `translate(${dockOffset.x}px, ${dockOffset.y}px)` }}
    >
      {expanded ? (
        <div className={styles.dockExpanded}>
          <div
            className={styles.dockHeader}
            onPointerDown={(event) => {
              const target = event.target as HTMLElement | null;
              if (target?.closest('button, input')) return;
              setDragState({ pointerId: event.pointerId, startX: event.clientX, startY: event.clientY });
              document.body.style.userSelect = 'none';
            }}
          >
            <h2 className={styles.dockTitle}>Site theme</h2>
            <button type="button" className={styles.toggleBtn} onClick={() => setExpanded(false)}>
              Hide
            </button>
          </div>
          <p className={styles.hint}>
            Live preview while you edit. Save writes global settings (same as Admin → Settings). On Breaking the Silence,
            use Page colors (bottom-left) for section-only overrides.
          </p>
          {loading || !loaded ? (
            <p className={styles.hint}>{loading ? 'Loading theme…' : 'Preparing…'}</p>
          ) : (
            <>
              <p className={styles.sectionLabel}>Colors</p>
              {PICKER_FIELDS.map(({ key, label }) => (
                <div key={key} className={styles.row}>
                  <label htmlFor={`site-theme-${key}`}>{label}</label>
                  <input
                    id={`site-theme-${key}`}
                    className={styles.picker}
                    type="color"
                    value={toHex7(
                      (typeof theme[key] === 'string' && theme[key]!.trim() ? theme[key]! : INPUT_FALLBACK[key]) as string
                    )}
                    onChange={(e) => updateColor(key, e.target.value)}
                    aria-label={label}
                  />
                  <button type="button" className={styles.clearBtn} onClick={() => clearColor(key)}>
                    Reset
                  </button>
                </div>
              ))}
              <div className={styles.glowBlock}>
                <label htmlFor="site-theme-primary-glow">Primary glow (hex + alpha)</label>
                <input
                  id="site-theme-primary-glow"
                  className={styles.glowInput}
                  type="text"
                  value={primaryGlow}
                  onChange={(e) => {
                    setPrimaryGlow(e.target.value);
                    setSavedMsg('');
                    setErrorMsg('');
                  }}
                  placeholder="#9a644633"
                  aria-label="Primary glow"
                />
                <button type="button" className={styles.clearBtn} onClick={clearPrimaryGlow}>
                  Reset glow
                </button>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.saveBtn} disabled={saving || !loaded} onClick={() => void handleSave()}>
                  {saving ? 'Saving…' : 'Save to CMS'}
                </button>
                {savedMsg ? <span className={styles.statusOk}>{savedMsg}</span> : null}
                {errorMsg ? <span className={styles.statusErr}>{errorMsg}</span> : null}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.dockCollapsed}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => {
              setExpanded(true);
            }}
          >
            Site theme
          </button>
        </div>
      )}
    </aside>
  );
}
