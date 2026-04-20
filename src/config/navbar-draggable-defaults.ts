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

export const DEFAULT_NAVBAR_DRAGGABLE: NavbarDraggableOffsets = NAVBAR_DRAG_IDS.reduce(
  (acc, id) => {
    if (id === 'logo') acc[id] = { x: -57, y: 0 };
    else if (id === 'donate') acc[id] = { x: 23, y: 0 }; // 23px is approx 6mm total
    else acc[id] = zero();
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

  const allZero = NAVBAR_DRAG_IDS.every((id) => out[id].x === 0 && out[id].y === 0);
  const nc = readPoint(o.navCluster);
  if (allZero && nc && (nc.x !== 0 || nc.y !== 0)) {
    for (const id of NAVBAR_DRAG_IDS) {
      out[id] = { ...nc };
    }
  }

  return out;
}
