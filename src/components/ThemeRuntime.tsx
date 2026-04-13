'use client';

import { useEffect } from 'react';

type ThemeConfig = {
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

type TypographyConfig = {
  fontFamily?: 'default' | 'patrick-hand';
};

const THEME_VAR_MAP: Record<keyof ThemeConfig, string> = {
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

function applyTheme(theme?: ThemeConfig) {
  if (!theme) {
    return;
  }

  const root = document.documentElement;

  for (const [themeKey, cssVar] of Object.entries(THEME_VAR_MAP) as Array<[keyof ThemeConfig, string]>) {
    const value = theme[themeKey];
    if (typeof value === 'string' && value.trim().length > 0) {
      root.style.setProperty(cssVar, value.trim());
    }
  }
}

function applyTypography(typography?: TypographyConfig) {
  if (!typography) {
    return;
  }

  const root = document.documentElement;
  const fontFamily = typography.fontFamily === 'patrick-hand' ? 'patrick-hand' : 'default';

  if (fontFamily === 'patrick-hand') {
    root.style.setProperty(
      '--font-sans',
      'var(--font-patrick-hand), var(--font-inter), system-ui, -apple-system, sans-serif'
    );
    root.style.setProperty(
      '--font-display',
      'var(--font-patrick-hand), var(--font-miriam), serif'
    );
  } else {
    root.style.setProperty(
      '--font-sans',
      'var(--font-inter), system-ui, -apple-system, sans-serif'
    );
    root.style.setProperty('--font-display', 'var(--font-miriam), serif');
  }
}

export default function ThemeRuntime() {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await fetch('/api/cms?type=config', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        applyTheme(data?.theme);
        applyTypography(data?.typography);
      } catch {
        // Theme defaults in globals.css are kept if remote fetch fails.
      }
    };

    void loadTheme();
  }, []);

  return null;
}
