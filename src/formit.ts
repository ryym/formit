import { FieldPath, ObjectFieldPath, PathPiece, createFieldPath } from './fieldPath';
import { dig } from './dig';

export interface FormitOptions<Vals extends AnyValues> {
  readonly initialValues: Vals;
}

export class Formit<Vals extends AnyValues> {
  readonly fields: ObjectFieldPath<Vals>;

  private _values: Vals;
  private readonly _dirtinesses: Map<string, boolean>;
  private readonly _changeHandlers: Map<string, ChangeHandler>;
  private _valueChangeListeners: OnValueChange[];

  constructor(options: FormitOptions<Vals>) {
    this._values = options.initialValues;
    this.fields = createFieldPath(() => this._values);

    this._dirtinesses = new Map();
    this._changeHandlers = new Map();
    this._valueChangeListeners = [];
  }

  values = (): Vals => {
    return this._values;
  };

  value = <T>(fieldPath: FieldPath<T>): T => {
    const path = FieldPath.pathOf(fieldPath);
    return dig(this._values, path) as T;
  };

  setValue = <T>(fieldPath: FieldPath<T>, value: T): void => {
    const oldValue = this.value(fieldPath);
    const path = FieldPath.pathOf(fieldPath);
    this._values = updateValue(this._values, value, path, 0) as Vals;

    const listenerParams: OnValueChangeParams<T> = { oldValue, newValue: value };
    this._valueChangeListeners.forEach((f) => f(fieldPath, listenerParams));
  };

  isDirty = (fieldPath: FieldPath<unknown>): boolean => {
    return this._dirtinesses.get(FieldPath.nameOf(fieldPath)) || false;
  };

  setDirty = (fieldPath: FieldPath<unknown>, dirty: boolean): void => {
    this._dirtinesses.set(FieldPath.nameOf(fieldPath), dirty);
  };

  handleChange = (fieldPath: FieldPath<unknown>): ChangeHandler => {
    const key = FieldPath.nameOf(fieldPath);
    let handler = this._changeHandlers.get(key);
    if (handler === undefined) {
      handler = (event) => {
        this.setValue(fieldPath, event.currentTarget.value);
      };
      this._changeHandlers.set(key, handler);
    }
    return handler;
  };

  onValueChange = (listener: OnValueChange): Unsubscribe => {
    this._valueChangeListeners.push(listener);
    return () => {
      this._valueChangeListeners = this._valueChangeListeners.filter((l) => l !== listener);
    };
  };
}

export type AnyValues = Record<string, unknown>;

export type Unsubscribe = () => void;

type Indexable = { [key: string]: unknown };

const updateValue = (values: unknown, value: unknown, path: PathPiece[], idx: number): unknown => {
  if (idx === path.length) {
    return value;
  }
  if (Array.isArray(values)) {
    const next = [...values];
    const valueIdx = path[idx] as number;
    next[valueIdx] = updateValue(next[valueIdx], value, path, idx + 1);
    return next;
  }
  if (typeof values === 'object') {
    if (values == null) {
      throw new Error(`[formit] must not be null: ${path.join(' > ')}`);
    }
    return {
      ...values,
      [path[0]]: updateValue((values as Indexable)[path[0]], value, path, idx + 1),
    };
  } else {
    throw new Error('[formit] [BUG] unreachable error thrown');
  }
};

export type OnValueChangeParams<T> = {
  readonly oldValue: T;
  readonly newValue: T;
};

export type OnValueChange = <T>(changedField: FieldPath<T>, params: OnValueChangeParams<T>) => void;

export type EventLike = {
  currentTarget: { value: unknown };
};
export type ChangeHandler = (event: EventLike) => void;
