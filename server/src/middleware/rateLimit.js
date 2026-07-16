import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

function jsonHandler(req, res) {
  res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
}

// Auth endpoints (login/register/forgot-password/etc.) are a brute-force and
// account-enumeration target — capped per IP regardless of outcome.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
})

// AI endpoints call the paid Gemini API and, on a detected payment intent,
// can create a real payment request — capped per authenticated user (falls
// back to IP for the rare unauthenticated case) to bound both cost and the
// blast radius of any single account being abused.
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  handler: jsonHandler,
})
