import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import prisma from '../config/prisma.js';
import authRepository from '../modules/auth/auth.repository.js';
import { AppError } from './error.middleware.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Check Cookies (Primary for Web)
    let token = req.cookies?.token;

    // Log for production debugging (Safe to remove after fix)
    if (!token && (process.env.NODE_ENV === 'production' || !!process.env.VERCEL)) {
      console.log(`[AUTH-DEBUG] No token found in cookies. Found header: ${!!req.headers.authorization}. Cookies present: ${Object.keys(req.cookies || {}).join(', ')}`);
    }

    // 2. Check Authorization Header (Fallback for API/Testing)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Unauthorized - Please log in to continue', 401);
    }

    const decoded = verifyToken(token);
    const id = decoded.id || decoded.userId;

    if (!id) {
       throw new AppError('Unauthorized - Malformed token payload', 401);
    }

    const user = await authRepository.findById(id);

    if (!user) {
      throw new AppError('Unauthorized - User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
};

export const authorizeVerified = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Unauthorized - Please log in first', 401));
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email not verified. Please verify your account to access this account.',
      unverified: true
    });
  }

  next();
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized - Please log in first', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access Denied - You do not have the required permissions for this action', 403));
    }

    next();
  };
};
