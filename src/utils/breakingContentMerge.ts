import fallbackContent from '@/data/breakingTheSilence.json';

export type BreakingPayload = typeof fallbackContent;
export type BreakingPageCopy = BreakingPayload['pageCopy'];
export type BreakingPartnerGroup = BreakingPageCopy['partnerGroups'][number];

function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object';
}

function mergeStringArray(fallback: string[], stored: unknown, length: number): string[] {
  const fb = fallback.length === length ? fallback : Array.from({ length }, (_, i) => fallback[i] ?? '');
  const raw = Array.isArray(stored) ? stored.map((x) => String(x)) : [];
  return Array.from({ length }, (_, i) => {
    const s = raw[i];
    return typeof s === 'string' && s.trim().length > 0 ? s : fb[i] ?? '';
  });
}

function mergePartnerGroups(fallback: BreakingPartnerGroup[], stored: unknown): BreakingPartnerGroup[] {
  if (!Array.isArray(stored)) {
    return fallback;
  }
  return fallback.map((def, i) => {
    const row = stored[i];
    if (!isObject(row)) {
      return def;
    }
    const itemsRaw = Array.isArray(row.items) ? row.items.filter((x) => typeof x === 'string') : [];
    const items =
      itemsRaw.length >= def.items.length
        ? itemsRaw.slice(0, def.items.length)
        : def.items.map((t, j) => (typeof itemsRaw[j] === 'string' ? itemsRaw[j] : t));
    return {
      title: typeof row.title === 'string' ? row.title : def.title,
      items,
      note: typeof row.note === 'string' ? row.note : def.note,
    };
  });
}

/** Merge Redis/API payload with repo defaults so new `pageCopy` keys survive older stored blobs. */
export function mergeBreakingPayload(stored: unknown): BreakingPayload {
  const fb = fallbackContent;
  const base =
    stored !== null && typeof stored === 'object'
      ? { ...(stored as Record<string, unknown>) }
      : {};

  const fbPc = fb.pageCopy;
  const stPc = isObject(base.pageCopy) ? base.pageCopy : {};

  const pageCopy: BreakingPageCopy = {
    ...fbPc,
    ...stPc,
    floatingNavLabels: mergeStringArray(fbPc.floatingNavLabels, stPc.floatingNavLabels, fbPc.floatingNavLabels.length),
    heroParagraphs: mergeStringArray(fbPc.heroParagraphs, stPc.heroParagraphs, fbPc.heroParagraphs.length),
    heroListItems: mergeStringArray(fbPc.heroListItems, stPc.heroListItems, fbPc.heroListItems.length),
    partnerGroups: mergePartnerGroups(fbPc.partnerGroups, stPc.partnerGroups),
  };

  const fbHf = fb.heroFrame;
  const stHf = isObject(base.heroFrame) ? base.heroFrame : {};
  const cardLinesFb =
    Array.isArray(fbHf.cardLines) && fbHf.cardLines.length >= 2
      ? [String(fbHf.cardLines[0]), String(fbHf.cardLines[1])]
      : ['', ''];
  const cardLinesSt = Array.isArray(stHf.cardLines) ? stHf.cardLines : [];
  const cardLines = mergeStringArray(cardLinesFb, cardLinesSt, 2);

  const heroFrame = {
    ...fbHf,
    ...stHf,
    cardTitle:
      typeof stHf.cardTitle === 'string' && stHf.cardTitle.trim()
        ? stHf.cardTitle
        : typeof fbHf.cardTitle === 'string'
          ? fbHf.cardTitle
          : 'Breaking the Silence',
    cardLines,
  };

  return {
    ...fb,
    ...base,
    pageCopy,
    heroFrame,
    mediaWall: {
      ...fb.mediaWall,
      ...(isObject(base.mediaWall) ? base.mediaWall : {}),
    },
  };
}
