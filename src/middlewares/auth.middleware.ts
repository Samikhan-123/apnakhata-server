import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import prisma from '../config/prisma.js';
import authRepository from '../modules/auth/auth.repository.js';
import { AppError } from './error.middleware.js';

export interface AuthRequest extends Request {
  user?: any;
  impersonatorId?: string;
  isReadOnly?: boolean;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Check Cookies (Primary for Web)
    let token = req.cookies?.token;


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
    req.impersonatorId = decoded.impersonatorId;
    req.isReadOnly = decoded.isReadOnly;

    // --- ZERO-TRUST READ-ONLY GUARD ---
    // If impersonating, strictly block all mutation methods unless it's the 'stop' endpoint
    if (req.isReadOnly && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (!req.path.endsWith('/impersonate/stop')) {
        throw new AppError('Diagnostic Session: Modification actions are disabled for safety.', 403);
      }
    }

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

    if (!roles.includes(req.user.role) && !req.impersonatorId) {
      return next(new AppError('Access Denied - You do not have the required permissions for this action', 403));
    }

    next();
  };
};
