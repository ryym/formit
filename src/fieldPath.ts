import { dig } from './dig';

export const SymFieldPath = Symbol('FieldPath');
const SymArrayField = Symbol('ArrayField');
const SymObjectField = Symbol('ObjectField');

export type AnyObject = Record<string, unknown>;

export type PathPiece = string | number;

type FieldPathInner<T> = {
  __ghost?: T;
  readonly name: string;
  readonly path: (string | number)[];
};

export class FieldPath<T> {
  static nameOf(f: FieldPath<unknown>): string {
    return f[SymFieldPath].name;
  }

  static pathOf(f: FieldPath<unknown>): PathPiece[] {
    return f[SymFieldPath].path;
  }

  readonly [SymFieldPath]: FieldPathInner<T>;

  private constructor() {}
}

const asFieldPath = <T>(object: unknown, inner: FieldPathInner<T>): FieldPath<T> => {
  Object.defineProperty(object, SymFieldPath, hiddenPropDesc(inner));
  return object as FieldPath<T>;
};

export type ArrayFieldPath<E> = FieldPath<E[]> & {
  readonly [SymArrayField]: true;
  (index: number): E extends AnyObject ? ObjectFieldPath<E> : FieldPath<E>;
};

export type ObjectFieldPath<T> = FieldPath<T> & {
  readonly [SymObjectField]: true;
} & {
    readonly [K in keyof T]: T[K] extends Array<infer E>
      ? ArrayFieldPath<E>
      : T[K] extends AnyObject
      ? ObjectFieldPath<T[K]>
      : FieldPath<T[K]>;
  };

export const createFieldPath = <T>(rootRef: () => T): ObjectFieldPath<T> => {
  const r = rootRef() as unknown;
  if (typeof r === 'object' && r != null && !Array.isArray(r)) {
    return buildObjectPath(rootRef, r as AnyObject, '', []) as ObjectFieldPath<T>;
  }
  throw new Error('[formit] path root must be a plain object');
};

const buildAnyFieldPath = (
  rootRef: () => unknown,
  value: unknown,
  name: string,
  path: PathPiece[]
): FieldPath<unknown> => {
  if (typeof value !== 'object' || value == null) {
    return asFieldPath({}, { name, path });
  }
  if (Array.isArray(value)) {
    return buildArrayPath(rootRef, name, path);
  }
  return buildObjectPath(rootRef, value as AnyObject, name, path);
};

const buildArrayPath = (
  rootRef: () => unknown,
  name: string,
  path: PathPiece[]
): ArrayFieldPath<unknown> => {
  const children: FieldPath<unknown>[] = [];
  const fn = ((idx: number) => {
    const childPathName = `${name}[${idx}]`;
    const values = dig(rootRef(), path) as unknown[];
    if (values.length <= idx) {
      throw new Error(`[formit] value ${childPathName} does not exist`);
    }
    if (!(idx in children)) {
      children[idx] = buildAnyFieldPath(rootRef, values[idx], childPathName, [...path, idx]);
    }
    return children[idx];
  }) as ArrayFieldPath<unknown>;

  const arrayPath = asFieldPath(fn, { name, path }) as ArrayFieldPath<unknown>;
  Object.defineProperties(arrayPath, {
    name: hiddenPropDesc(name),
    [SymArrayField]: hiddenPropDesc(true),
  });

  return arrayPath;
};

const buildObjectPath = (
  rootRef: () => unknown,
  value: AnyObject,
  name: string,
  path: PathPiece[]
): ObjectFieldPath<unknown> => {
  if (isNonObjectInstance(value)) {
    throw new Error('[formit] non-plain objects are not supported');
  }

  const objectPath = asFieldPath({}, { name, path }) as ObjectFieldPath<unknown>;
  Object.defineProperties(objectPath, { [SymObjectField]: hiddenPropDesc(true) });

  for (const key in value) {
    (objectPath as any)[key] = buildAnyFieldPath(
      rootRef,
      value[key as keyof typeof value],
      name === '' ? key : `${name}.${key}`,
      [...path, key]
    );
  }

  return objectPath;
};

const isNonObjectInstance = (value: { constructor?: unknown }): boolean => {
  const { constructor } = value;
  return typeof constructor === 'function' && constructor !== objectConstructor;
};
const objectConstructor = {}.constructor;

const hiddenPropDesc = (value: unknown): PropertyDescriptor => {
  return {
    value,
    writable: false,
    enumerable: false,
    configurable: true,
  };
};
