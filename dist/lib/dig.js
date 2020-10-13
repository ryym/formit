"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dig = void 0;
exports.dig = (obj, path) => {
    return _dig(obj, path, 0);
};
const _dig = (obj, path, idx) => {
    if (typeof obj !== 'object' || obj == null || idx === path.length) {
        return obj;
    }
    if (path[idx] in obj) {
        return _dig(obj[path[idx]], path, idx + 1);
    }
    throw new Error(`[formit] key not found: ${path.slice(0, idx + 1).join(' > ')}`);
};
