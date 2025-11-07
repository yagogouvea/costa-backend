"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_JWT_EXPIRATION_VALUE = exports.JWT_EXPIRATION = exports.getJwtExpiration = void 0;
const DEFAULT_JWT_EXPIRATION = '7d';
const normalize = (value) => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};
const getJwtExpiration = () => {
    return normalize(process.env.JWT_EXPIRATION) || DEFAULT_JWT_EXPIRATION;
};
exports.getJwtExpiration = getJwtExpiration;
exports.JWT_EXPIRATION = (0, exports.getJwtExpiration)();
exports.DEFAULT_JWT_EXPIRATION_VALUE = DEFAULT_JWT_EXPIRATION;

