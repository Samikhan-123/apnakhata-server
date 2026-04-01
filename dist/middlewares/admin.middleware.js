import { AppError } from './error.middleware.js';
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        return next();
    }
    return next(new AppError('Forbidden: Admin access required', 403));
};
//# sourceMappingURL=admin.middleware.js.map