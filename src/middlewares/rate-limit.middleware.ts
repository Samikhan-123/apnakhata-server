import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * 100 requests per minute
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sensitive Auth Rate Limiter
 * 5 requests per minute
 */
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
