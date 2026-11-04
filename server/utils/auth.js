import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from './errors.js';

const COOKIE_NAME = process.env.COOKIE_NAME || 'nurtalim_session';

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAMESITE || 'lax';
  return {
    httpOnly: true,
    secure: isProduction || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function signAdminToken(admin) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: String(admin.id), role: admin.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError('UNAUTHORIZED', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('UNAUTHORIZED', 401);
  }

  const admin = await prisma.admin.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, email: true, role: true },
  });

  if (!admin || admin.role !== 'admin') {
    throw new AppError('FORBIDDEN', 403);
  }

  req.admin = admin;
  next();
});
