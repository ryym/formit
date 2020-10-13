export declare const SymFieldPath: unique symbol;
declare const SymArrayField: unique symbol;
declare const SymObjectField: unique symbol;
export declare type AnyObject = Record<string, unknown>;
export declare type PathPiece = string | number;
declare type FieldPathInner<T> = {
    __ghost?: T;
    readonly name: string;
    readonly path: (string | number)[];
};
export declare class FieldPath<T> {
    static nameOf(f: FieldPath<unknown>): string;
    static pathOf(f: FieldPath<unknown>): PathPiece[];
    readonly [SymFieldPath]: FieldPathInner<T>;
    private constructor();
}
export declare type ArrayFieldPath<E> = FieldPath<E[]> & {
    readonly [SymArrayField]: true;
    (index: number): E extends AnyObject ? ObjectFieldPath<E> : FieldPath<E>;
};
export declare type ObjectFieldPath<T> = FieldPath<T> & {
    readonly [SymObjectField]: true;
} & {
    readonly [K in keyof T]: T[K] extends Array<infer E> ? ArrayFieldPath<E> : T[K] extends AnyObject ? ObjectFieldPath<T[K]> : FieldPath<T[K]>;
};
export declare const createFieldPath: <T>(rootRef: () => T) => ObjectFieldPath<T>;
export {};
