"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicFormit = exports.createFormit = void 0;
const fieldPath_1 = require("./fieldPath");
const dig_1 = require("./dig");
exports.createFormit = (options) => {
    return new BasicFormit(options);
};
class BasicFormit {
    constructor(options) {
        var _a;
        this._submitCount = 0;
        this.values = () => {
            return this._values;
        };
        this.value = (fieldPath) => {
            const path = fieldPath_1.FieldPath.pathOf(fieldPath);
            return dig_1.dig(this._values, path);
        };
        this.setValue = (fieldPath, value) => {
            const oldValue = this.value(fieldPath);
            const path = fieldPath_1.FieldPath.pathOf(fieldPath);
            this._values = updateValue(this._values, value, path, 0);
            this.setEdited(fieldPath, true);
            const listenerParams = {
                oldValue,
                newValue: value,
                formit: this,
            };
            this._valueChangeListeners.forEach((f) => f(fieldPath, listenerParams));
        };
        this.isEdited = (fieldPath) => {
            return this._dirtinesses.get(fieldPath_1.FieldPath.nameOf(fieldPath)) || false;
        };
        this.setEdited = (fieldPath, dirty) => {
            this._dirtinesses.set(fieldPath_1.FieldPath.nameOf(fieldPath), dirty);
        };
        this.handleChange = (fieldPath) => {
            const key = fieldPath_1.FieldPath.nameOf(fieldPath);
            let handler = this._changeHandlers.get(key);
            if (handler === undefined) {
                handler = (event) => {
                    this.setValue(fieldPath, event.target.value);
                };
                this._changeHandlers.set(key, handler);
            }
            return handler;
        };
        this.onValueChange = (listener) => {
            this._valueChangeListeners.push(listener);
            return () => {
                this._valueChangeListeners = this._valueChangeListeners.filter((l) => l !== listener);
            };
        };
        this.handleSubmit = (event) => {
            event.preventDefault();
            this._submitCount += 1;
            this._onSubmit(this);
        };
        this.submitCount = () => {
            return this._submitCount;
        };
        this._values = options.initialValues;
        this.fields = fieldPath_1.createFieldPath(() => this._values);
        this._dirtinesses = new Map();
        this._changeHandlers = new Map();
        this._valueChangeListeners = [];
        this._onSubmit = (_a = options.onSubmit) !== null && _a !== void 0 ? _a : (() => { });
        if (options.onValueChange != null) {
            this._valueChangeListeners.push(options.onValueChange);
        }
    }
}
exports.BasicFormit = BasicFormit;
const updateValue = (values, value, path, idx) => {
    if (idx === path.length) {
        return value;
    }
    if (Array.isArray(values)) {
        const next = [...values];
        const valueIdx = path[idx];
        next[valueIdx] = updateValue(next[valueIdx], value, path, idx + 1);
        return next;
    }
    if (typeof values === 'object') {
        if (values == null) {
            throw new Error(`[formit] must not be null: ${path.join(' > ')}`);
        }
        return Object.assign(Object.assign({}, values), { [path[idx]]: updateValue(values[path[idx]], value, path, idx + 1) });
    }
    else {
        throw new Error('[formit] [BUG] unreachable error thrown');
    }
};
