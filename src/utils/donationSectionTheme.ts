const HEX6 = /^#[0-9A-Fa-f]{6}$/;

/** Placeholder for `<input type="color" />` when no custom section colour is set. */
export const DONATION_SECTION_COLOR_INPUT_FALLBACK = '#64748b';

export function normalizeDonationSectionHex(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  if (!HEX6.test(t)) return undefined;
  return t.slice(0, 7).toLowerCase();
}

function hexToRgb(hex: string) {
  const value = hex.slice(1, 7);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex);
  const map = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * map(rgb.r) + 0.7152 * map(rgb.g) + 0.0722 * map(rgb.b);
}

const PAGE_THEME_VARS: Record<string, string> = {
  '--donation-project-bg': 'var(--background)',
  '--donation-project-fg': 'var(--foreground)',
  '--donation-project-muted': 'var(--text-muted)',
};

/** CSS variables for tab + panel when `sectionColor` is a valid `#rrggbb`; `null` or invalid → page theme. */
export function donationSectionStyleVars(sectionColor: string | null | undefined): Record<string, string> {
  if (sectionColor === null) {
    return PAGE_THEME_VARS;
  }
  const hex = normalizeDonationSectionHex(sectionColor);
  if (!hex) {
    return PAGE_THEME_VARS;
  }
  const lum = relativeLuminance(hex);
  const light = lum > 0.45;
  return {
    '--donation-project-bg': hex,
    '--donation-project-fg': light ? '#0f172a' : '#ffffff',
    '--donation-project-muted': light ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.92)',
  };
}

export function donationSectionColorForInput(draft: string): string {
  return normalizeDonationSectionHex(draft) ?? DONATION_SECTION_COLOR_INPUT_FALLBACK;
}
