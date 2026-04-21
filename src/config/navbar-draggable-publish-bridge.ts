import type { NavbarDraggableOffsets } from '@/config/navbar-draggable-defaults';

/**
 * Keeps the latest navbar drag offsets in sync for Hero "Publish layout", which
 * otherwise GETs config and can POST a stale `navbarDraggable` before a navbar
 * drag save finishes (same-tab race).
 */
let hydrated = false;
let live: NavbarDraggableOffsets | null = null;

export function resetNavbarDraggablePublishBridge() {
  hydrated = false;
  live = null;
}

/** Call after a successful CMS config fetch (server offsets are authoritative). */
export function syncNavbarDraggableForPublish(offsets: NavbarDraggableOffsets) {
  live = { ...offsets };
  hydrated = true;
}

/** Call whenever local drag offsets change; no-op until hydrated from server. */
export function updateNavbarDraggableForPublish(offsets: NavbarDraggableOffsets) {
  if (!hydrated) {
    return;
  }
  live = { ...offsets };
}

export function getNavbarDraggableForHeroPublish(): NavbarDraggableOffsets | null {
  return hydrated && live ? live : null;
}
