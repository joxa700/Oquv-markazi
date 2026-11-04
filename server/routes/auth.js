import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { loginRateLimit } from '../middleware/rateLimits.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema } from '../validation/schemas.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { getCookieName, getCookieOptions, requireAdmin, signAdminToken } from '../utils/auth.js';

const router = Router();
const DUMMY_HASH = '$2b$10$6epMRpbJAB70DCnIcTiX3.dcN00cjtrlxchujjbt7ViqYMvaEs7C6';

router.post(
  '/login',
  loginRateLimit,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    const passwordMatches = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);

    if (!admin || admin.role !== 'admin' || !passwordMatches) {
      throw new AppError('INVALID_CREDENTIALS', 401);
    }

    const token = signAdminToken(admin);
    res.cookie(getCookieName(), token, getCookieOptions());
    res.json({
      user: { id: admin.id, email: admin.email, role: admin.role },
    });
  }),
);

router.post('/logout', (_req, res) => {
  const options = getCookieOptions();
  res.clearCookie(getCookieName(), {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
  res.json({ success: true });
});

router.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ user: req.admin });
  }),
);

export default router;
