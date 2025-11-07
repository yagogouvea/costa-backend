import jwt from 'jsonwebtoken';
import { JWT_EXPIRATION } from '../config/jwt.config';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está definida. Configure a variável de ambiente JWT_SECRET.');
}

export interface TokenPayload {
  id: string;
  email: string;
  permissions: string[];
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}; 