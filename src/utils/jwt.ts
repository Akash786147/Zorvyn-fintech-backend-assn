import jwt from 'jsonwebtoken';
import { createLogger } from './logger';

const logger = createLogger('jwt');

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRY || '1h';

  try {
    const token = jwt.sign(payload as any, secret, { expiresIn } as any);
    logger.info('Access token generated', { username: payload.username });
    return token;
  } catch (error) {
    logger.error('Failed to generate access token', error);
    throw error;
  }
};

export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';

  try {
    const token = jwt.sign(payload as any, secret, { expiresIn } as any);
    logger.info('Refresh token generated', { username: payload.username });
    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', error);
    throw error;
  }
};

export const generateTokenPair = (
  payload: Omit<JwtPayload, 'iat' | 'exp'>
): TokenResponse => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const expiresIn = parseInt(process.env.JWT_EXPIRY || '3600', 10);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    logger.info('Access token verified', { userId: decoded.id });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Access token expired', { expiredAt: error.expiredAt });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid access token', { message: error.message });
    } else {
      logger.error('Failed to verify access token', error);
    }
    return null;
  }
};


export const verifyRefreshToken = (token: string): JwtPayload | null => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    logger.info('Refresh token verified', { userId: decoded.id });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Refresh token expired', { expiredAt: error.expiredAt });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid refresh token', { message: error.message });
    } else {
      logger.error('Failed to verify refresh token', error);
    }
    return null;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded;
  } catch (error) {
    logger.error('Failed to decode token', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const getTokenRemainingTime = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - currentTime;
  return Math.max(0, remaining);
};
