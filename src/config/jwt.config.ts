const DEFAULT_JWT_EXPIRATION = '7d';

const normalize = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getJwtExpiration = (): string => {
  return normalize(process.env.JWT_EXPIRATION) || DEFAULT_JWT_EXPIRATION;
};

export const JWT_EXPIRATION = getJwtExpiration();

export const DEFAULT_JWT_EXPIRATION_VALUE = DEFAULT_JWT_EXPIRATION;

