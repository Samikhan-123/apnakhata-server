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
  validate: { 
    xForwardedForHeader: false,
    trustProxy: false
  },
});

/**
 * Sensitive Auth Rate Limiter
 * 5 requests per 5 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { 
    xForwardedForHeader: false,
    trustProxy: false
  },
});
