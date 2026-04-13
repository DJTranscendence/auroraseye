'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './AdminPageThemeDock.module.css';

type AdminPageColors = {
  pageBackground?: string;
  panelBackground?: string;
  panelText?: string;
  panelMutedText?: string;
  panelAccent?: string;
};

const HEX = /^#([\da-f]{6}|[\da-f]{8})$/i;
const STORAGE_KEY = 'admin-dashboard-page-colors';
const DOCK_POSITION_KEY = 'admin-dashboard-theme-dock-offset';

const INPUT_FALLBACK: Record<keyof AdminPageColors, string> = {
  pageBackground: '#1b1512',
  panelBackground: '#2c221c',
  panelText: '#f5efe7',
  panelMutedText: '#ceb8a8',
  panelAccent: '#9a6446',
};

const COLOR_FIELDS: Array<{ key: keyof AdminPageColors; label: string }> = [
  { key: 'pageBackground', label: 'Page' },
  { key: 'panelBackground', label: 'Cards / panels' },
  { key: 'panelText', label: 'Main text' },
  { key: 'panelMutedText', label: 'Muted text' },
  { key: 'panelAccent', label: 'Accent' },
];

function mergeColors(raw: unknown): AdminPageColors {
  if (!raw || typeof raw !== 'object') return {};
  const next: AdminPageColors = {};
  for (const { key } of COLOR_FIELDS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === 'string' && HEX.test(value.trim())) {
      next[key] = value.trim().slice(0, 7);
    }
  }
  return next;
}

function toHex7(value: string): string {
  if (!HEX.test(value)) return '#000000';
  return value.slice(0, 7);
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

type Props = { children: ReactNode };

export default function AdminPageThemeDock({ children }: Props) {
  const isAdmin = useAdminStatus();
  const [expanded, setExpanded] = useState(false);
  const [colors, setColors] = useState<AdminPageColors>({});
  const [dockOffset, setDockOffset] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ pointerId: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setColors(mergeColors(JSON.parse(raw)));
    } catch {
      // ignore malformed local data
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    } catch {
      // ignore storage errors
    }
  }, [colors]);

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

  const wrapperStyle = useMemo(() => {
    const style: CSSProperties = {};
    const vars = style as Record<string, string>;
    if (colors.pageBackground) vars['--admin-page-bg'] = colors.pageBackground;
    if (colors.panelBackground) vars['--admin-panel-bg'] = colors.panelBackground;
    if (colors.panelText) vars['--admin-panel-text'] = colors.panelText;
    if (colors.panelMutedText) vars['--admin-panel-muted'] = colors.panelMutedText;
    if (colors.panelAccent) vars['--admin-panel-accent'] = colors.panelAccent;
    return style;
  }, [colors]);

  const updateColor = (key: keyof AdminPageColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const clearColor = (key: keyof AdminPageColors) => {
    setColors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div style={wrapperStyle}>
      {children}
      {isAdmin ? (
        <aside
          className={styles.dock}
          aria-label="Admin dashboard colors"
          style={{ transform: `translate(${dockOffset.x}px, ${dockOffset.y}px)` }}
        >
          {expanded ? (
            <div className={styles.panel}>
              <div
                className={styles.header}
                onPointerDown={(event) => {
                  const target = event.target as HTMLElement | null;
                  if (target?.closest('button, input')) return;
                  setDragState({ pointerId: event.pointerId, startX: event.clientX, startY: event.clientY });
                  document.body.style.userSelect = 'none';
                }}
              >
                <h2>Dashboard colors</h2>
                <button type="button" className={styles.toggle} onClick={() => setExpanded(false)}>
                  Hide
                </button>
              </div>
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className={styles.row}>
                  <label htmlFor={`admin-color-${key}`}>{label}</label>
                  <input
                    id={`admin-color-${key}`}
                    type="color"
                    value={toHex7(colors[key] || INPUT_FALLBACK[key])}
                    onChange={(event) => updateColor(key, event.target.value)}
                  />
                  <button type="button" className={styles.clear} onClick={() => clearColor(key)}>
                    Clear
                  </button>
                </div>
              ))}
              <p>Saved locally for this browser while you test layout colors.</p>
            </div>
          ) : (
            <div className={styles.collapsed}>
              <button type="button" className={styles.toggle} onClick={() => setExpanded(true)}>
                Dashboard colors
              </button>
            </div>
          )}
        </aside>
      ) : null}
    </div>
  );
}
