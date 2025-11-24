"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pick = (obj, keys) => {
    const finalObj = {};
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key];
        }
    }
    return finalObj;
};
exports.default = pick;
