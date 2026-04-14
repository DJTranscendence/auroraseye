/** Shared defaults for navbar drag offsets (server + client). */

export type NavDragId = 'homeIcon' | 'navLinks' | 'ticker' | 'donate' | 'socialIcons';

export type NavbarDraggableOffsets = Record<NavDragId, { x: number; y: number }>;

export const DEFAULT_NAVBAR_DRAGGABLE: NavbarDraggableOffsets = {
  homeIcon: { x: 0, y: 0 },
  navLinks: { x: 0, y: 0 },
  ticker: { x: -49, y: 0 },
  donate: { x: 0, y: 0 },
  socialIcons: { x: 0, y: 0 },
};

export function mergeNavbarDraggableFromApi(raw: unknown): NavbarDraggableOffsets {
  const out: NavbarDraggableOffsets = {
    homeIcon: { ...DEFAULT_NAVBAR_DRAGGABLE.homeIcon },
    navLinks: { ...DEFAULT_NAVBAR_DRAGGABLE.navLinks },
    ticker: { ...DEFAULT_NAVBAR_DRAGGABLE.ticker },
    donate: { ...DEFAULT_NAVBAR_DRAGGABLE.donate },
    socialIcons: { ...DEFAULT_NAVBAR_DRAGGABLE.socialIcons },
  };
  if (!raw || typeof raw !== 'object') {
    return out;
  }
  const o = raw as Record<string, { x?: unknown; y?: unknown }>;
  (Object.keys(out) as NavDragId[]).forEach((key) => {
    const p = o[key];
    if (!p || typeof p !== 'object') return;
    const x = Number(p.x);
    const y = Number(p.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      out[key] = { x, y };
    }
  });
  return out;
}
