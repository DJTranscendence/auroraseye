/** Shared defaults for navbar drag offsets (server + client). Each key is one horizontal group in the header. */

export const NAVBAR_DRAG_IDS = [
  'logo',
  'homeIcon',
  'documentaries',
  'ourTeam',
  'news',
  'contactUs',
  'ticker',
  'donate',
  'socials',
] as const;

export type NavDragId = (typeof NAVBAR_DRAG_IDS)[number];

export type NavbarDraggableOffsets = Record<NavDragId, { x: number; y: number }>;

const zero = (): { x: number; y: number } => ({ x: 0, y: 0 });

/** All zeros: tune positions in admin and save; legacy negative logo X caused clipping on many widths. */
export const DEFAULT_NAVBAR_DRAGGABLE: NavbarDraggableOffsets = NAVBAR_DRAG_IDS.reduce(
  (acc, id) => {
    acc[id] = zero();
    return acc;
  },
  {} as NavbarDraggableOffsets,
);

function readPoint(raw: unknown): { x: number; y: number } | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const p = raw as Record<string, unknown>;
  const x = Number(p.x);
  const y = Number(p.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    return { x, y };
  }
  return null;
}

export function mergeNavbarDraggableFromApi(raw: unknown): NavbarDraggableOffsets {
  const out: NavbarDraggableOffsets = NAVBAR_DRAG_IDS.reduce((acc, id) => {
    acc[id] = { ...DEFAULT_NAVBAR_DRAGGABLE[id] };
    return acc;
  }, {} as NavbarDraggableOffsets);

  if (!raw || typeof raw !== 'object') {
    return out;
  }
  const o = raw as Record<string, unknown>;

  for (const id of NAVBAR_DRAG_IDS) {
    const pt = readPoint(o[id]);
    if (pt) {
      out[id] = pt;
    }
  }

  const legacyYoutubeNav = readPoint((o as Record<string, unknown>).youtubeNav);
  if (legacyYoutubeNav && !readPoint((o as Record<string, unknown>).contactUs)) {
    out.contactUs = legacyYoutubeNav;
  }

  // Legacy `navCluster` used to fan one offset onto every widget — a bad value shifted the entire bar
  // off-screen under `overflow-x: hidden`. Ignore navCluster; use per-id keys only.

  const clampX = (id: NavDragId, x: number) => {
    const minX = id === 'logo' ? 0 : -48;
    const maxX = 420;
    return Math.min(maxX, Math.max(minX, x));
  };

  for (const id of NAVBAR_DRAG_IDS) {
    out[id] = { x: clampX(id, out[id].x), y: out[id].y };
  }

  return out;
}
