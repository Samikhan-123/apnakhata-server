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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized - No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Unauthorized - Invalid token', 401);
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

    req.user = user;
    next();
  } catch (error: any) {
    console.error('[AUTH ERROR]:', error.message);
    next(new AppError('Unauthorized - Invalid or expired token', 401));
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
