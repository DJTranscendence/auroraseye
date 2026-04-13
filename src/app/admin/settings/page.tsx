'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";
import { Save, Settings, Video, Contact, Palette, RotateCcw } from "lucide-react";
import Link from "next/link";

type ThemeConfig = {
  headerBackground: string;
  background: string;
  foreground: string;
  primary: string;
  primaryGlow: string;
  surface: string;
  surfaceMuted: string;
  textMuted: string;
  border: string;
  accent: string;
};

type TypographyConfig = {
  fontFamily: 'default' | 'patrick-hand';
};

type SwatchKey =
  | 'background'
  | 'surface'
  | 'surfaceMuted'
  | 'foreground'
  | 'textMuted'
  | 'primary'
  | 'accent'
  | 'border';

type ThemeKey = keyof ThemeConfig;

type ThemePreset = {
  id: string;
  vibe: 'soft' | 'earthy' | 'bold';
  label: string;
  description: string;
  theme: ThemeConfig;
};

type BackgroundPreset = {
  id: string;
  label: string;
  header: string;
  main: string;
};

type SiteConfig = {
  hero: {
    title: string;
    description: string;
    videoUrl: string;
    bgImage: string;
    controls?: Record<string, unknown>;
    controlsMobile?: Record<string, unknown>;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    youtube: string;
    instagram: string;
    linkedin: string;
  };
  theme: ThemeConfig;
  typography?: TypographyConfig;
};

const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  fontFamily: 'default',
};

const DEFAULT_HERO_CTA_OFFSETS = {
  supportCtaOffsetX: 0,
  supportCtaOffsetY: 0,
  recruitmentOffsetX: 0,
  recruitmentOffsetY: 0,
} as const;

function mergeHeroCtaOffsets(hero: SiteConfig['hero']): SiteConfig['hero'] {
  return {
    ...hero,
    controls: { ...(hero.controls ?? {}), ...DEFAULT_HERO_CTA_OFFSETS },
    controlsMobile: { ...(hero.controlsMobile ?? {}), ...DEFAULT_HERO_CTA_OFFSETS },
  };
}

function buildRestoredSiteConfig(current: SiteConfig): SiteConfig {
  return {
    ...current,
    theme: { ...FEMININE_BROWN_AQUA_THEME },
    typography: DEFAULT_TYPOGRAPHY,
    hero: mergeHeroCtaOffsets(current.hero),
  };
}

const FEMININE_BROWN_AQUA_THEME: ThemeConfig = {
  headerBackground: '#0a0b12',
  background: '#1b1512',
  foreground: '#f5efe7',
  primary: '#9a6446',
  primaryGlow: '#9a644633',
  surface: '#2c221c',
  surfaceMuted: '#3a2c23',
  textMuted: '#ceb8a8',
  border: '#6e5345',
  accent: '#42c5c0',
};

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'brown-aqua',
    vibe: 'earthy',
    label: 'Feminine Earth and Aqua',
    description: 'Warm cocoa neutrals with bright aqua accents.',
    theme: FEMININE_BROWN_AQUA_THEME,
  },
  {
    id: 'sand-coral',
    vibe: 'soft',
    label: 'Desert Rose',
    description: 'Soft sand tones with coral highlights and calm teal contrast.',
    theme: {
      headerBackground: '#141012',
      background: '#221913',
      foreground: '#f6eee7',
      primary: '#bf7153',
      primaryGlow: '#bf715333',
      surface: '#36261d',
      surfaceMuted: '#4a3327',
      textMuted: '#d6bfad',
      border: '#866452',
      accent: '#58c7be',
    },
  },
  {
    id: 'truffle-mint',
    vibe: 'soft',
    label: 'Truffle and Mint',
    description: 'Deep truffle base with fresh mint and champagne text.',
    theme: {
      headerBackground: '#120f0f',
      background: '#181412',
      foreground: '#f3ede6',
      primary: '#8b5e44',
      primaryGlow: '#8b5e4433',
      surface: '#29201b',
      surfaceMuted: '#3a2c24',
      textMuted: '#cdb7a6',
      border: '#6f5548',
      accent: '#6ed6c7',
    },
  },
  {
    id: 'mocha-lagoon',
    vibe: 'bold',
    label: 'Mocha Lagoon',
    description: 'Mocha browns balanced by cool lagoon blues for clarity.',
    theme: {
      headerBackground: '#120f10',
      background: '#171213',
      foreground: '#f7f1e8',
      primary: '#996346',
      primaryGlow: '#99634633',
      surface: '#302224',
      surfaceMuted: '#433033',
      textMuted: '#d6beb2',
      border: '#7a5e56',
      accent: '#4fc3d0',
    },
  },
  {
    id: 'umber-seafoam',
    vibe: 'earthy',
    label: 'Umber and Seafoam',
    description: 'Rich umber with airy seafoam accents and elegant contrast.',
    theme: {
      headerBackground: '#16100d',
      background: '#1d1410',
      foreground: '#f8f0e8',
      primary: '#a0664b',
      primaryGlow: '#a0664b33',
      surface: '#31231d',
      surfaceMuted: '#443127',
      textMuted: '#d8c0b0',
      border: '#825f4f',
      accent: '#7ad7cf',
    },
  },
];

const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'porcelain-ivory',
    label: 'Porcelain + Ivory',
    header: '#f1f1f5',
    main: '#f7f2ee',
  },
  {
    id: 'blush-cream',
    label: 'Blush + Cream',
    header: '#f6eef0',
    main: '#fbf6f1',
  },
  {
    id: 'mist-sand',
    label: 'Mist + Sand',
    header: '#eef3f4',
    main: '#f8f4ee',
  },
  {
    id: 'lavender-ivory',
    label: 'Lavender + Ivory',
    header: '#f1eff6',
    main: '#faf6f0',
  },
  {
    id: 'sage-porcelain',
    label: 'Sage + Porcelain',
    header: '#eef2ee',
    main: '#f6f2ed',
  },
];

const THEME_VARIABLES: Record<keyof ThemeConfig, string> = {
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

const SWATCH_KEYS: SwatchKey[] = [
  'background',
  'surface',
  'surfaceMuted',
  'foreground',
  'textMuted',
  'primary',
  'accent',
  'border',
];

const SWATCH_OPTIONS: Record<SwatchKey, string[]> = SWATCH_KEYS.reduce((accumulator, key) => {
  accumulator[key] = Array.from(new Set(THEME_PRESETS.map((preset) => preset.theme[key])));
  return accumulator;
}, {} as Record<SwatchKey, string[]>);

const ensureTheme = (theme: Partial<ThemeConfig> | undefined): ThemeConfig => ({
  ...FEMININE_BROWN_AQUA_THEME,
  ...(theme ?? {}),
});

const HEX_COLOR_PATTERN = /^#([\da-f]{6}|[\da-f]{8})$/i;

function hexToHsl(hexColor: string) {
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
}

function hslToHex(hue: number, saturation: number, lightness: number) {
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
}

function shiftHexHue(hexColor: string, hueShift: number) {
  if (!HEX_COLOR_PATTERN.test(hexColor)) {
    return hexColor;
  }

  const baseHex = hexColor.slice(0, 7);
  const alphaHex = hexColor.length === 9 ? hexColor.slice(7, 9) : '';
  const { hue, saturation, lightness } = hexToHsl(baseHex);
  const nextHue = (hue + hueShift + 360) % 360;
  return `${hslToHex(nextHue, saturation, lightness)}${alphaHex}`;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function buildTone(hexColor: string, lightness: number, saturation: number) {
  if (!HEX_COLOR_PATTERN.test(hexColor)) {
    return hexColor;
  }

  const baseHex = hexColor.slice(0, 7);
  const alphaHex = hexColor.length === 9 ? hexColor.slice(7, 9) : '';
  const { hue } = hexToHsl(baseHex);
  return `${hslToHex(hue, clamp(saturation, 0, 1), clamp(lightness, 0, 1))}${alphaHex}`;
}

function buildHarmoniousTheme(
  mainBackground: string,
  headerBackground: string,
  vibe: ThemePreset['vibe'] = 'soft'
): ThemeConfig {
  const baseMain = HEX_COLOR_PATTERN.test(mainBackground) ? mainBackground : FEMININE_BROWN_AQUA_THEME.background;
  const baseHeader = HEX_COLOR_PATTERN.test(headerBackground) ? headerBackground : baseMain;
  const toneMap: Record<ThemePreset['vibe'], { header: number; background: number; surface: number; muted: number; text: number; textMuted: number; border: number }> = {
    soft: { header: 0.94, background: 0.97, surface: 0.94, muted: 0.91, text: 0.18, textMuted: 0.42, border: 0.78 },
    earthy: { header: 0.92, background: 0.95, surface: 0.92, muted: 0.89, text: 0.2, textMuted: 0.44, border: 0.76 },
    bold: { header: 0.9, background: 0.93, surface: 0.9, muted: 0.87, text: 0.24, textMuted: 0.48, border: 0.74 },
  };
  const tones = toneMap[vibe] ?? toneMap.soft;

  return {
    headerBackground: buildTone(baseHeader, tones.header, 0.14),
    background: buildTone(baseMain, tones.background, 0.12),
    surface: buildTone(baseMain, tones.surface, 0.12),
    surfaceMuted: buildTone(baseMain, tones.muted, 0.12),
    foreground: buildTone(baseMain, tones.text, 0.22),
    textMuted: buildTone(baseMain, tones.textMuted, 0.16),
    border: buildTone(baseMain, tones.border, 0.12),
    primary: '#9a6446',
    primaryGlow: '#9a644633',
    accent: '#42c5c0',
  };
}

function applyHueShiftToTheme(theme: ThemeConfig, hueShift: number): ThemeConfig {
  if (hueShift === 0) {
    return { ...theme };
  }

  return {
    headerBackground: shiftHexHue(theme.headerBackground, hueShift),
    background: shiftHexHue(theme.background, hueShift),
    foreground: shiftHexHue(theme.foreground, hueShift),
    primary: shiftHexHue(theme.primary, hueShift),
    primaryGlow: shiftHexHue(theme.primaryGlow, hueShift),
    surface: shiftHexHue(theme.surface, hueShift),
    surfaceMuted: shiftHexHue(theme.surfaceMuted, hueShift),
    textMuted: shiftHexHue(theme.textMuted, hueShift),
    border: shiftHexHue(theme.border, hueShift),
    accent: shiftHexHue(theme.accent, hueShift),
  };
}

const isSameTheme = (left: ThemeConfig, right: ThemeConfig) =>
  (Object.keys(left) as Array<keyof ThemeConfig>).every(
    (key) => left[key].toLowerCase() === right[key].toLowerCase()
  );

const getMatchingPreset = (theme: ThemeConfig) =>
  THEME_PRESETS.find((preset) => isSameTheme(theme, preset.theme)) ?? null;

const VIBE_LABELS: Record<'all' | ThemePreset['vibe'], string> = {
  all: 'All vibes',
  soft: 'Soft and Romantic',
  earthy: 'Earthy and Feminine',
  bold: 'Bold and Cinematic',
};

export default function ManageSettings() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [themeSeed, setThemeSeed] = useState<ThemeConfig | null>(null);
  const [hueShift, setHueShift] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<'all' | ThemePreset['vibe']>('all');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/cms?type=config', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.details || data?.error || 'Unable to load settings.');
        }

        const baseTheme = ensureTheme(data?.theme);
        setThemeSeed(baseTheme);
        setHueShift(0);
        setConfig({
          ...data,
          theme: baseTheme,
          typography: data?.typography ?? DEFAULT_TYPOGRAPHY,
        });
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load settings.');
      } finally {
        setLoading(false);
      }
    };

    void loadConfig();
  }, []);

  useEffect(() => {
    if (!config?.theme) {
      return;
    }

    const root = document.documentElement;
    const theme = ensureTheme(config.theme);

    (Object.entries(THEME_VARIABLES) as Array<[keyof ThemeConfig, string]>).forEach(([key, cssVar]) => {
      root.style.setProperty(cssVar, theme[key]);
    });

    const typography = config.typography ?? DEFAULT_TYPOGRAPHY;
    if (typography.fontFamily === 'patrick-hand') {
      root.style.setProperty(
        '--font-sans',
        'var(--font-patrick-hand), var(--font-inter), system-ui, -apple-system, sans-serif'
      );
      root.style.setProperty('--font-display', 'var(--font-patrick-hand), var(--font-miriam), serif');
    } else {
      root.style.setProperty('--font-sans', 'var(--font-inter), system-ui, -apple-system, sans-serif');
      root.style.setProperty('--font-display', 'var(--font-miriam), serif');
    }
  }, [config?.theme, config?.typography]);

  const syncThemeFromSeed = (nextSeed: ThemeConfig, nextHueShift = hueShift) => {
    setThemeSeed(nextSeed);
    setConfig((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        theme: applyHueShiftToTheme(nextSeed, nextHueShift),
      };
    });
  };

  const applyHarmoniousPalette = (nextMainBackground: string, nextHeaderBackground: string, vibe = selectedVibe) => {
    if (!config) {
      return;
    }

    const nextTheme = buildHarmoniousTheme(nextMainBackground, nextHeaderBackground, vibe === 'all' ? 'soft' : vibe);
    setHueShift(0);
    setThemeSeed(nextTheme);
    setConfig({
      ...config,
      theme: nextTheme,
    });
  };

  const updateTheme = (key: ThemeKey, value: string) => {
    if (!config) {
      return;
    }

    const nextSeed = {
      ...(themeSeed ?? ensureTheme(config.theme)),
      [key]: value,
    };

    syncThemeFromSeed(nextSeed);
  };

  const applyThemePreset = (presetId: string) => {
    if (!config || presetId === 'custom') {
      return;
    }

    const preset = THEME_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setConfig({
      ...config,
      theme: applyHueShiftToTheme(preset.theme, hueShift),
    });
    setThemeSeed({ ...preset.theme });
    setSelectedVibe(preset.vibe);
  };

  const handleHueShiftChange = (nextHueShift: number) => {
    setHueShift(nextHueShift);

    if (!themeSeed) {
      return;
    }

    setConfig((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        theme: applyHueShiftToTheme(themeSeed, nextHueShift),
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage('');

      const response = await fetch('/api/cms?type=config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Unable to save settings.');
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      setSaved(false);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!config) {
      return;
    }

    const nextConfig = buildRestoredSiteConfig(config);

    setThemeSeed({ ...FEMININE_BROWN_AQUA_THEME });
    setHueShift(0);
    setSelectedVibe('earthy');
    setConfig(nextConfig);

    try {
      setSaving(true);
      setErrorMessage('');

      const response = await fetch('/api/cms?type=config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextConfig),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Unable to restore defaults.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auroras-reset-navbar-widget-positions'));
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      setSaved(false);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to restore defaults.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading settings...</p>;

  if (!config) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className="container">
            <p className={styles.errorMessage}>{errorMessage || 'Settings are unavailable right now.'}</p>
            <Link href="/admin" className="btn btn-outline">Back to Dashboard</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const selectedPreset = getMatchingPreset(themeSeed ?? config.theme);
  const effectiveSeedTheme = themeSeed ?? ensureTheme(config.theme);
  const filteredPresets = selectedVibe === 'all'
    ? THEME_PRESETS
    : THEME_PRESETS.filter((preset) => preset.vibe === selectedVibe);

  const presetVisible = selectedPreset
    ? filteredPresets.some((preset) => preset.id === selectedPreset.id)
    : false;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.titleInfo}>
              <Settings size={32} className="text-primary" />
              <div>
                <h1>Global Site Settings</h1>
                <p>Update hero content, contact information, and social links.</p>
              </div>
            </div>
            <Link href="/admin" className="btn btn-outline">Back to Dashboard</Link>
          </div>

          {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}

          <div className={styles.settingsGrid}>
            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <Video size={24} />
                <h2>Hero Section</h2>
              </div>
              <div className={styles.formGroup}>
                <label>Main Headline</label>
                <input 
                  value={config.hero.title} 
                  onChange={e => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Description</label>
                <textarea 
                  value={config.hero.description} 
                  onChange={e => setConfig({...config, hero: {...config.hero, description: e.target.value}})}
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Video URL (YouTube)</label>
                <input 
                  value={config.hero.videoUrl} 
                  onChange={e => setConfig({...config, hero: {...config.hero, videoUrl: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fallback Background Image URL</label>
                <input 
                  value={config.hero.bgImage} 
                  onChange={e => setConfig({...config, hero: {...config.hero, bgImage: e.target.value}})}
                />
              </div>
            </section>

            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <Contact size={24} />
                <h2>Contact & Social</h2>
              </div>
              <div className={styles.formGroup}>
                <label>Contact Email</label>
                <input 
                  value={config.contact.email} 
                  onChange={e => setConfig({...config, contact: {...config.contact, email: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Physical Address</label>
                <textarea 
                  value={config.contact.address} 
                  onChange={e => setConfig({...config, contact: {...config.contact, address: e.target.value}})}
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>YouTube Channel URL</label>
                <input 
                  value={config.contact.youtube} 
                  onChange={e => setConfig({...config, contact: {...config.contact, youtube: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Instagram URL</label>
                <input 
                  value={config.contact.instagram} 
                  onChange={e => setConfig({...config, contact: {...config.contact, instagram: e.target.value}})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>LinkedIn URL</label>
                <input 
                  value={config.contact.linkedin} 
                  onChange={e => setConfig({...config, contact: {...config.contact, linkedin: e.target.value}})}
                />
              </div>

            </section>

            <section className={styles.settingCard}>
              <div className={styles.cardHeader}>
                <Palette size={24} />
                <h2>Theme Editor</h2>
              </div>

              <p className={styles.cardDescription}>
                Build a softer, feminine look with earthy brown and aqua accents.
              </p>

              <div className={styles.formGroup}>
                <label>Pastel Background Palette</label>
                <div className={styles.colorFieldRow}>
                  <div className={styles.colorField}>
                    <span>Header</span>
                    <input
                      type="color"
                      value={config.theme.headerBackground}
                      onChange={(event) =>
                        applyHarmoniousPalette(config.theme.background, event.target.value)
                      }
                    />
                  </div>
                  <div className={styles.colorField}>
                    <span>Main</span>
                    <input
                      type="color"
                      value={config.theme.background}
                      onChange={(event) =>
                        applyHarmoniousPalette(event.target.value, config.theme.headerBackground)
                      }
                    />
                  </div>
                </div>
                <div className={styles.presetRow}>
                  {BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={styles.presetButton}
                      onClick={() => applyHarmoniousPalette(preset.main, preset.header)}
                    >
                      <span className={styles.presetSwatch}>
                        <span style={{ background: preset.header }} />
                        <span style={{ background: preset.main }} />
                      </span>
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className={styles.presetHint}>
                  Choosing these automatically harmonizes the rest of the site palette.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Font Style</label>
                <select
                  value={(config.typography ?? DEFAULT_TYPOGRAPHY).fontFamily}
                  onChange={(event) =>
                    setConfig({
                      ...config,
                      typography: {
                        fontFamily: event.target.value as TypographyConfig['fontFamily'],
                      },
                    })
                  }
                >
                  <option value="default">Current (Inter + Miriam)</option>
                  <option value="patrick-hand">Patrick Hand</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Palette Vibe</label>
                <select
                  value={selectedVibe}
                  onChange={e => setSelectedVibe(e.target.value as 'all' | ThemePreset['vibe'])}
                >
                  {Object.entries(VIBE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Harmonious Color Combo</label>
                <select
                  value={selectedPreset && presetVisible ? selectedPreset.id : 'custom'}
                  onChange={e => applyThemePreset(e.target.value)}
                >
                  <option value="custom">Custom (manual colors)</option>
                  {filteredPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </select>
                <p className={styles.presetHint}>
                  {selectedPreset?.description ?? 'You are editing a custom mix.'}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Hue Slider ({hueShift > 0 ? `+${hueShift}` : hueShift}deg)</label>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={hueShift}
                  onChange={e => handleHueShiftChange(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => handleHueShiftChange(0)}
                >
                  Reset Hue
                </button>
              </div>

              <div className={styles.colorGrid}>
                <div className={styles.colorControl}>
                  <label>Background</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.background.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.background.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('background', color)}
                        aria-label={`Background ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Surface</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.surface.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.surface.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('surface', color)}
                        aria-label={`Surface ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Surface Muted</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.surfaceMuted.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.surfaceMuted.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('surfaceMuted', color)}
                        aria-label={`Surface muted ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Text</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.foreground.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.foreground.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('foreground', color)}
                        aria-label={`Text ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Text Muted</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.textMuted.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.textMuted.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('textMuted', color)}
                        aria-label={`Text muted ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Primary (Brown)</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.primary.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.primary.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('primary', color)}
                        aria-label={`Primary ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Accent (Aqua)</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.accent.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.accent.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('accent', color)}
                        aria-label={`Accent ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.colorControl}>
                  <label>Border</label>
                  <div className={styles.swatchRow}>
                    {SWATCH_OPTIONS.border.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.swatch} ${effectiveSeedTheme.border.toLowerCase() === color.toLowerCase() ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTheme('border', color)}
                        aria-label={`Border ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Primary Glow (supports alpha, for example #9a644633)</label>
                <input
                  value={config.theme.primaryGlow}
                  onChange={e => updateTheme('primaryGlow', e.target.value)}
                  placeholder="#9a644633"
                />
              </div>

              <div className={styles.themePreview}>
                <div className={styles.previewHeader}>Live Theme Preview</div>
                <div className={styles.previewButtons}>
                  <button type="button" className={`btn btn-primary ${styles.previewButton}`}>Primary Action</button>
                  <button type="button" className={`btn btn-outline ${styles.previewButton}`}>Secondary Action</button>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.footerActions}>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              disabled={saving}
              className="btn btn-lg btn-outline"
            >
              <RotateCcw size={20} /> Restore defaults (theme, font, hero CTAs, navbar widgets)
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`btn btn-lg ${saved ? styles.savedBtn : 'btn-primary'}`}
            >
              <Save size={20} /> {saving ? 'Saving...' : saved ? 'Settings Saved!' : 'Save All Settings'}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
