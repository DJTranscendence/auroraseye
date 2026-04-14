/** Shared defaults for navbar drag offsets (server + client). One cluster = menu + widgets after logo. */

export type NavDragId = 'navCluster';

export type NavbarDraggableOffsets = {
  navCluster: { x: number; y: number };
};

export const DEFAULT_NAVBAR_DRAGGABLE: NavbarDraggableOffsets = {
  navCluster: { x: 0, y: 0 },
};

export function mergeNavbarDraggableFromApi(raw: unknown): NavbarDraggableOffsets {
  const out: NavbarDraggableOffsets = {
    navCluster: { ...DEFAULT_NAVBAR_DRAGGABLE.navCluster },
  };
  if (!raw || typeof raw !== 'object') {
    return out;
  }
  const o = raw as Record<string, unknown>;
  const nc = o.navCluster;
  if (nc && typeof nc === 'object') {
    const p = nc as Record<string, unknown>;
    const x = Number(p.x);
    const y = Number(p.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      out.navCluster = { x, y };
    }
  }
  return out;
}
