import rateLimit from 'express-rate-limit';

function limitHandler(_req, res) {
  res.status(429).json({ error: { code: 'RATE_LIMITED' } });
}

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

export const publicPostRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: Number(process.env.PUBLIC_POST_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});
