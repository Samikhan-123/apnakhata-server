import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from './error.middleware.js';

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  
  return next(new AppError('Forbidden: Admin access required', 403));
};
