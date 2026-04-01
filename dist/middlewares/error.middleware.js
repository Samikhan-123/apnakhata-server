import { z } from 'zod';
import logger from '../utils/logger.js';
export const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Log all 500 errors for internal tracking (even in production)
    if (statusCode === 500) {
        logger.error(`${req.method} ${req.path}`, {
            statusCode,
            message,
            stack: err.stack,
            body: req.body,
            params: req.params,
            query: req.query,
            user: req.user ? req.user.id : 'unauthenticated'
        });
    }
    // Handle Zod Validation Errors
    if (err instanceof z.ZodError || err.name === 'ZodError') {
        statusCode = 400;
        const firstIssue = err.errors?.[0];
        message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation Error';
        return res.status(statusCode).json({
            success: false,
            message,
            errors: err.errors
        });
    }
    // Handle Prisma Known Request Errors (e.g., unique constraints)
    if (err.code && err.code.startsWith('P')) {
        statusCode = 400;
        if (err.code === 'P2002') {
            const target = err.meta?.target;
            message = target ? `A record with this ${target.join(', ')} already exists.` : 'Duplicate record found.';
        }
        else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found.';
        }
    }
    const isProduction = process.env.NODE_ENV === 'production';
    // Final Response
    res.status(statusCode).json({
        success: false,
        message,
        ...(isProduction ? {} : { stack: err.stack, error: err })
    });
};
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=error.middleware.js.map