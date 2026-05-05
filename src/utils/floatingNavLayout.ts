/** Viewport width at or below which section floating nav uses mobile vertical rules. */
export const FLOATING_NAV_MOBILE_MAX_WIDTH = 768;

export function isFloatingNavMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= FLOATING_NAV_MOBILE_MAX_WIDTH;
}

export function readCssLengthPx(varName: string, fallbackPx: number): number {
  if (typeof window === 'undefined') {
    return fallbackPx;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) {
    return fallbackPx;
  }
  if (raw.endsWith('px')) {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallbackPx;
  }
  if (raw.endsWith('rem')) {
    const rem = parseFloat(raw);
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return Number.isFinite(rem) ? rem * fs : fallbackPx;
  }
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallbackPx;
}

/** ~2mm expressed in CSS pixels (96px reference). */
export function gapTwoMmPx(): number {
  return (2 * 96) / 25.4;
}

/** ~4mm expressed in CSS pixels. */
export function gapFourMmPx(): number {
  return (4 * 96) / 25.4;
}

/** ~5mm expressed in CSS pixels. */
export function gapFiveMmPx(): number {
  return (5 * 96) / 25.4;
}

/** Space below the fixed site navbar before the floating section nav (mobile). */
export function mobileFloatingNavClearanceBelowNavbarPx(): number {
  return gapTwoMmPx() * 2 + 12;
}

/** Default `top` (px) for fixed section nav on mobile: navbar + clearance. */
export function mobileFloatingNavDefaultTopPx(): number {
  return readCssLengthPx('--nav-height', 72) + mobileFloatingNavClearanceBelowNavbarPx();
}

/** Karsha Nuns: default mobile `top` is lower than Breaking the Silence. */
export function karshaMobileFloatingNavDefaultTopPx(): number {
  return mobileFloatingNavDefaultTopPx() + gapFourMmPx() + gapFiveMmPx();
}
