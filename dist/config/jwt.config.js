"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_JWT_EXPIRATION_VALUE = exports.JWT_EXPIRATION = exports.getJwtExpiration = void 0;
const DEFAULT_JWT_EXPIRATION = '7d';
const normalize = (value) => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    return (Number.isNaN(Number(trimmed)) ? trimmed : Number(trimmed));
};
const getJwtExpiration = () => {
    const normalized = normalize(process.env.JWT_EXPIRATION);
    return (normalized !== null && normalized !== void 0 ? normalized : DEFAULT_JWT_EXPIRATION);
};
exports.getJwtExpiration = getJwtExpiration;
exports.JWT_EXPIRATION = (0, exports.getJwtExpiration)();
exports.DEFAULT_JWT_EXPIRATION_VALUE = DEFAULT_JWT_EXPIRATION;
