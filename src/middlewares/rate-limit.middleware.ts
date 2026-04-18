import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Smart Key Generator: 
 * Prioritizes User ID (Authenticated) to avoid IP-clashing for legitimate users on shared networks.
 * Falls back to IP for anonymous traffic.
 */
const keyGenerator = (req: Request) => {
  return (req as any).user?.id || req.ip;
};

/**
 * Global API Rate Limiter
 * 120 requests per minute
 * Increased from 100 to accommodate heavy dashboard component hydration.
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, 
  keyGenerator,
  validate: { default: false }, // Disable all internal validations for custom keys (Fixes ERR_ERL_KEY_GEN_IPV6)
  message: {
    success: false,
    message: 'Too many requests. Please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Removed trustProxy override to use global app.set('trust proxy')
});

/**
 * Sensitive Auth Rate Limiter
 * 5 requests per 5 minutes
 * Strictly IP-based to prevent brute-force attacks on individual accounts 
 * or batch attacks from specific nodes.
 */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP identifies the attacker node clearly here.
});
