"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFieldPath = exports.FieldPath = exports.SymFieldPath = void 0;
const dig_1 = require("./dig");
exports.SymFieldPath = Symbol('FieldPath');
const SymArrayField = Symbol('ArrayField');
const SymObjectField = Symbol('ObjectField');
class FieldPath {
    constructor() { }
    static nameOf(f) {
        return f[exports.SymFieldPath].name;
    }
    static pathOf(f) {
        return f[exports.SymFieldPath].path;
    }
}
exports.FieldPath = FieldPath;
const asFieldPath = (object, inner) => {
    Object.defineProperty(object, exports.SymFieldPath, hiddenPropDesc(inner));
    return object;
};
exports.createFieldPath = (rootRef) => {
    const r = rootRef();
    if (typeof r === 'object' && r != null && !Array.isArray(r)) {
        return buildObjectPath(rootRef, r, '', []);
    }
    throw new Error('[formit] path root must be a plain object');
};
const buildAnyFieldPath = (rootRef, value, name, path) => {
    if (typeof value !== 'object' || value == null) {
        return asFieldPath({}, { name, path });
    }
    if (Array.isArray(value)) {
        return buildArrayPath(rootRef, name, path);
    }
    return buildObjectPath(rootRef, value, name, path);
};
const buildArrayPath = (rootRef, name, path) => {
    const children = [];
    const fn = ((idx) => {
        const childPathName = `${name}[${idx}]`;
        const values = dig_1.dig(rootRef(), path);
        if (values.length <= idx) {
            throw new Error(`[formit] value ${childPathName} does not exist`);
        }
        if (!(idx in children)) {
            children[idx] = buildAnyFieldPath(rootRef, values[idx], childPathName, [...path, idx]);
        }
        return children[idx];
    });
    const arrayPath = asFieldPath(fn, { name, path });
    Object.defineProperties(arrayPath, {
        name: hiddenPropDesc(name),
        [SymArrayField]: hiddenPropDesc(true),
    });
    return arrayPath;
};
const buildObjectPath = (rootRef, value, name, path) => {
    if (isNonObjectInstance(value)) {
        throw new Error('[formit] non-plain objects are not supported');
    }
    const objectPath = asFieldPath({}, { name, path });
    Object.defineProperties(objectPath, { [SymObjectField]: hiddenPropDesc(true) });
    for (const key in value) {
        objectPath[key] = buildAnyFieldPath(rootRef, value[key], `${name}.${key}`, [...path, key]);
    }
    return objectPath;
};
const isNonObjectInstance = (value) => {
    const { constructor } = value;
    return typeof constructor === 'function' && constructor !== objectConstructor;
};
const objectConstructor = {}.constructor;
const hiddenPropDesc = (value) => {
    return {
        value,
        writable: false,
        enumerable: false,
        configurable: true,
    };
};
