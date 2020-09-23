type Key = string | number;

export const dig = (obj: unknown, path: Key[]): unknown => {
  return _dig(obj, path, 0);
};

const _dig = (obj: unknown, path: Key[], idx: number): unknown => {
  if (typeof obj !== 'object' || obj == null || idx === path.length) {
    return obj;
  }
  if (path[idx] in obj) {
    return _dig((obj as Record<Key, unknown>)[path[idx]], path, idx + 1);
  }
  throw new Error(`[formit] key not found: ${path.slice(0, idx + 1).join(' > ')}`);
};
