import type { SignOptions } from 'jsonwebtoken';

const DEFAULT_JWT_EXPIRATION: SignOptions['expiresIn'] = '7d';

const normalize = (value?: string | null): SignOptions['expiresIn'] | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return (Number.isNaN(Number(trimmed)) ? trimmed : Number(trimmed)) as SignOptions['expiresIn'];
};

export const getJwtExpiration = (): SignOptions['expiresIn'] => {
  const normalized = normalize(process.env.JWT_EXPIRATION);
  return (normalized ?? DEFAULT_JWT_EXPIRATION) as SignOptions['expiresIn'];
};

export const JWT_EXPIRATION = getJwtExpiration();

export const DEFAULT_JWT_EXPIRATION_VALUE = DEFAULT_JWT_EXPIRATION;

