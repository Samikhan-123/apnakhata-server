import { z } from 'zod';
import logger from '../utils/logger.js';
export const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    const isProduction = process.env.NODE_ENV === 'production';
    // Log to terminal in development OR log critical errors (500) in production
    if (!isProduction || statusCode === 500) {
        const logMethod = statusCode === 500 ? 'error' : 'warn';
        logger[logMethod](`${req.method} ${req.path} [${statusCode}]`, {
            message,
            stack: err.cause?.stack || err.stack, // Prefer original cause stack if available
            body: req.body,
            params: req.params,
            query: req.query,
            user: req.user ? req.user.id : 'unauthenticated'
        });
    }
    // Zod Validation Errors
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
    // Handle Prisma Known Request Errors 
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
        else {
            // Catch-all for other Prisma errors to avoid leaking internals
            message = 'Something went wrong. Please try again later.';
        }
    }
    // Final Sanitization: Ensure no raw Prisma/DB internal strings leak in the message
    const technicalKeywords = ['Prisma', 'database', 'table', 'relation', 'public.', 'invocation', 'constraint'];
    const isTechnical = technicalKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    if (isTechnical && isProduction) {
        message = 'Something went wrong on our end. Please try again later.';
    }
    // Response
    res.status(statusCode).json({
        success: false,
        message,
        ...(isProduction ? {} : {
            stack: err.cause?.stack || err.stack,
            originalError: err.cause?.message || err.message,
            code: err.code
        })
    });
};
export class AppError extends Error {
    statusCode;
    isOperational;
    cause;
    constructor(message, statusCode, cause) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.cause = cause;
        if (cause && cause.stack) {
            this.stack = `${this.stack}\n\n[ORIGINAL CAUSE STACK]:\n${cause.stack}`;
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=error.middleware.js.map