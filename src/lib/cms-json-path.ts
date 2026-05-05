export type JsonPathSegment = string | number;

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getByPath(root: unknown, path: JsonPathSegment[]): unknown {
  let cur: unknown = root;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') {
      return undefined;
    }
    if (Array.isArray(cur)) {
      const idx = typeof key === 'number' ? key : Number(key);
      if (!Number.isFinite(idx)) {
        return undefined;
      }
      cur = cur[idx];
    } else {
      cur = (cur as Record<string, unknown>)[String(key)];
    }
  }
  return cur;
}

/** Immutable deep set (clones along the path). Supports object keys and numeric array indices. */
export function setByPath(root: Record<string, unknown>, path: JsonPathSegment[], value: unknown): Record<string, unknown> {
  if (path.length === 0) {
    return root;
  }
  const base = deepClone(root);

  const setIn = (parent: unknown, depth: number): unknown => {
    const key = path[depth];
    const isLast = depth === path.length - 1;

    if (Array.isArray(parent)) {
      const idx = typeof key === 'number' ? key : Number(key);
      if (!Number.isFinite(idx)) {
        return parent;
      }
      const arr = [...parent];
      if (isLast) {
        arr[idx] = value;
        return arr;
      }
      arr[idx] = setIn(arr[idx], depth + 1);
      return arr;
    }

    const obj = { ...(parent as Record<string, unknown>) };
    const sk = String(key);
    if (isLast) {
      obj[sk] = value as never;
      return obj;
    }
    obj[sk] = setIn(obj[sk], depth + 1) as never;
    return obj;
  };

  return setIn(base, 0) as Record<string, unknown>;
}
