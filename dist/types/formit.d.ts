import { FieldPath, ObjectFieldPath } from './fieldPath';
export interface FormitOptions<Vals extends AnyValues> {
    readonly initialValues: Vals;
    readonly onValueChange?: OnValueChange<Vals>;
    readonly onSubmit?: OnSubmit<Vals>;
}
export interface Formit<Vals extends AnyValues> {
    readonly fields: ObjectFieldPath<Vals>;
    values(): Vals;
    value<T>(fieldPath: FieldPath<T>): T;
    setValue<T>(fieldPath: FieldPath<T>, value: T): void;
    isEdited(fieldPath: FieldPath<unknown>): boolean;
    handleChange(fieldPath: FieldPath<unknown>): ChangeHandler;
    onValueChange(listener: OnValueChange<Vals>): Unsubscribe;
    handleSubmit(event: unknown): void;
    submitCount(): number;
}
export declare const createFormit: <Vals extends unknown>(options: FormitOptions<Vals>) => Formit<Vals>;
export declare class BasicFormit<Vals extends AnyValues> implements Formit<Vals> {
    readonly fields: ObjectFieldPath<Vals>;
    private _values;
    private readonly _dirtinesses;
    private readonly _changeHandlers;
    private _valueChangeListeners;
    private _submitCount;
    private readonly _onSubmit;
    constructor(options: FormitOptions<Vals>);
    values: () => Vals;
    value: <T>(fieldPath: FieldPath<T>) => T;
    setValue: <T>(fieldPath: FieldPath<T>, value: T) => void;
    isEdited: (fieldPath: FieldPath<unknown>) => boolean;
    setEdited: (fieldPath: FieldPath<unknown>, dirty: boolean) => void;
    handleChange: (fieldPath: FieldPath<unknown>) => ChangeHandler;
    onValueChange: (listener: OnValueChange<Vals>) => Unsubscribe;
    handleSubmit: (event: unknown) => void;
    submitCount: () => number;
}
export declare type AnyValues = any;
export declare type Unsubscribe = () => void;
export declare type OnValueChangeParams<T, Vals extends AnyValues> = {
    readonly oldValue: T;
    readonly newValue: T;
    readonly formit: Formit<Vals>;
};
export declare type OnValueChange<Vals extends AnyValues> = <T>(changedField: FieldPath<T>, params: OnValueChangeParams<T, Vals>) => void;
export declare type OnSubmit<Vals extends AnyValues> = (formit: Formit<Vals>) => void;
export declare type EventLike = {
    target: {
        value: unknown;
    };
};
export declare type ChangeHandler = (event: EventLike | {
    value: unknown;
}) => void;
