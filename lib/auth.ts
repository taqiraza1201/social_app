import jwt from 'jsonwebtoken';
import crypto from 'crypto';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export interface UserJwtPayload {
  userId: string;
  email: string;
  type: 'user';
}

export interface AdminJwtPayload {
  adminId: string;
  username: string;
  type: 'admin';
}

export function signUserToken(payload: Omit<UserJwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'user' }, getJwtSecret(), { expiresIn: '7d' });
}

export function signAdminToken(payload: Omit<AdminJwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'admin' }, getJwtSecret(), { expiresIn: '1d' });
}

export function verifyUserToken(token: string): UserJwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as UserJwtPayload;
    if (decoded.type !== 'user') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminJwtPayload;
    if (decoded.type !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10); // 10 minute expiry
  return expiry;
}
