'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './PageThemeDock.module.css';

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
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const map = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * map(rgb.r) + 0.7152 * map(rgb.g) + 0.0722 * map(rgb.b);
}

export type PageColors = {
  pageBackground?: string;
  textColor?: string;
  headingTextColor?: string;
  textMutedColor?: string;
  accentColor?: string;
  surfaceColor?: string;
  surfaceMutedColor?: string;
  border?: string;
};

const COLOR_FIELDS: Array<{ key: keyof PageColors; label: string }> = [
  { key: 'pageBackground', label: 'Background' },
  { key: 'textColor', label: 'Body text' },
  { key: 'headingTextColor', label: 'Heading text' },
  { key: 'textMutedColor', label: 'Muted Text' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'surfaceColor', label: 'Surface' },
  { key: 'surfaceMutedColor', label: 'Surface Muted' },
  { key: 'border', label: 'Border' },
];

function mergePageColors(raw: any): PageColors {
  if (!raw || typeof raw !== 'object') return {};
  const next: PageColors = {};
  for (const { key } of COLOR_FIELDS) {
    const v = raw[key];
    if (typeof v === 'string' && v.trim() && HEX.test(v.trim())) {
      next[key] = v.trim().slice(0, 7);
    }
  }
  return next;
}

const DOCK_POSITION_KEY_PREFIX = 'page-theme-dock-offset-';

interface PageThemeDockProps {
  pageType:
    | 'breakingTheSilence'
    | 'karshaNuns'
    | 'home'
    | 'news'
    | 'documentaries'
    | 'donations'
    | 'contact'
    | 'team';
  initialColors: any;
  initialPayload: any;
  children: ReactNode;
}

export default function PageThemeDock({
  pageType,
  initialColors,
  initialPayload,
  children
}: PageThemeDockProps) {
  const [colors, setColors] = useState<PageColors>(() => mergePageColors(initialColors));
  
  useEffect(() => {
    if (initialColors) {
      setColors(mergePageColors(initialColors));
    }
  }, [initialColors]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [dockOffset, setDockOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ pointerId: number; startX: number; startY: number } | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        setIsAdmin(user?.role === 'admin');
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const storageKey = DOCK_POSITION_KEY_PREFIX + pageType;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
          setDockOffset(parsed);
        }
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dockOffset));
    } catch {}
  }, [dockOffset, storageKey]);

  const cssVars = useMemo(() => {
    const style: any = {};
    if (colors.pageBackground) style['--background'] = colors.pageBackground;
    if (colors.textColor) style['--foreground'] = colors.textColor;
    if (colors.headingTextColor) style['--page-heading'] = colors.headingTextColor;
    if (colors.textMutedColor) style['--text-muted'] = colors.textMutedColor;
    if (colors.accentColor) style['--accent'] = colors.accentColor;
    if (colors.surfaceColor) style['--surface'] = colors.surfaceColor;
    if (colors.surfaceMutedColor) style['--surface-muted'] = colors.surfaceMutedColor;
    if (colors.border) style['--border'] = colors.border;
    
    // Auto-calculate contrast for readability if background is set
    if (colors.pageBackground) {
      const isLight = relativeLuminance(colors.pageBackground) > 0.5;
      if (!colors.textColor) style['--foreground'] = isLight ? '#000' : '#fff';
      if (!colors.headingTextColor) style['--page-heading'] = isLight ? '#0f172a' : '#f8fafc';
      if (!colors.textMutedColor) style['--text-muted'] = isLight ? '#444' : '#ccc';
    }

    return style as CSSProperties;
  }, [colors]);

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      let cmsType = pageType;
      let dataKey = 'pageColors';
      
      if (
        pageType === 'home' ||
        pageType === 'news' ||
        pageType === 'documentaries' ||
        pageType === 'donations' ||
        pageType === 'contact' ||
        pageType === 'team'
      ) {
        cmsType = 'config' as any;
        if (pageType === 'home') dataKey = 'homePageTheme';
        else if (pageType === 'news') dataKey = 'newsPageTheme';
        else if (pageType === 'documentaries') dataKey = 'documentariesPageTheme';
        else if (pageType === 'donations') dataKey = 'donationsPageTheme';
        else if (pageType === 'contact') dataKey = 'contactPageTheme';
        else dataKey = 'teamPageTheme';
      }

      const res = await fetch(`/api/cms?type=${cmsType}`, { cache: 'no-store' });
      const current = res.ok ? await res.json() : initialPayload;
      
      const payload = {
        ...current,
        [dataKey]: colors
      };

      const saveRes = await fetch(`/api/cms?type=${cmsType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (saveRes.ok) {
        setSavedMsg('Saved');
        setTimeout(() => setSavedMsg(''), 2000);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (key: keyof PageColors, val: string) => {
    setColors(prev => ({ ...prev, [key]: val }));
  };

  const resetColor = (key: keyof PageColors) => {
    setColors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    if (!dragState) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== dragState.pointerId) return;
      setDockOffset(prev => ({
        x: prev.x + (e.clientX - dragState.startX),
        y: prev.y + (e.clientY - dragState.startY)
      }));
      setDragState({ pointerId: e.pointerId, startX: e.clientX, startY: e.clientY });
    };
    const onUp = () => setDragState(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragState]);

  return (
    <div
      style={{ ...cssVars, background: 'var(--background)', minHeight: '100vh' }}
      className={`page-theme-wrapper ${styles.pageRoot}`}
    >
      {children}
      {isAdmin && (
        <aside 
          ref={dockRef as any}
          className={styles.dock}
          style={{ transform: `translate(${dockOffset.x}px, ${dockOffset.y}px)` }}
        >
          {expanded ? (
            <div className={styles.expanded}>
              <div 
                className={styles.header}
                onPointerDown={e => {
                  if ((e.target as HTMLElement).closest('button, input')) return;
                  setDragState({ pointerId: e.pointerId, startX: e.clientX, startY: e.clientY });
                }}
              >
                <span className={styles.title}>Page Theme</span>
                <button className={styles.closeBtn} onClick={() => setExpanded(false)}>Hide</button>
              </div>
              <div className={styles.body}>
                {COLOR_FIELDS.map(({ key, label }) => (
                  <div key={key} className={styles.field}>
                    <label>{label}</label>
                    <div className={styles.inputWrap}>
                      <input 
                        type="color" 
                        value={toHex7(colors[key] || '#000000')} 
                        onChange={e => updateColor(key, e.target.value)}
                      />
                      <button onClick={() => resetColor(key)}>×</button>
                    </div>
                  </div>
                ))}
                <div className={styles.footer}>
                  <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? '...' : 'Save Page Theme'}
                  </button>
                  {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
                </div>
              </div>
            </div>
          ) : (
            <button className={styles.collapsed} onClick={() => setExpanded(true)}>
              🎨 Page Theme
            </button>
          )}
        </aside>
      )}
    </div>
  );
}
