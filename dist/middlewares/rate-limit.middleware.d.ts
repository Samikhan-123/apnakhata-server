/**
 * Global API Rate Limiter
 * 100 requests per minute
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Sensitive Auth Rate Limiter
 * 5 requests per minute
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
