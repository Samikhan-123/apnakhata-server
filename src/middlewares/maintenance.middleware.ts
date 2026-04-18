import { Request, Response, NextFunction } from 'express';
import settingsService from '../modules/admin/settings.service.js';
import { AuthRequest } from './auth.middleware.js';

/**
 * Middleware to block access for non-admin users when maintenance mode is active
 */
export const maintenanceGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isMaintenance = await settingsService.isMaintenanceMode();
    
    if (!isMaintenance) {
      return next();
    }

    // Bypass for Admins (if already authenticated)
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.role === 'ADMIN') {
      return next();
    }

    // Bypass for login/auth, status heartbeat, and administrative API
    if (req.path.startsWith('/api/auth') || req.path === '/api/system/status' || req.path.startsWith('/api/admin')) {
      return next();
    }

    // Block others
    res.status(503).json({
      success: false,
      message: 'Platform is currently under maintenance. Please check back later.',
      code: 'MAINTENANCE_MODE'
    });
  } catch (error) {
    // If settings check fails, default to allowing next() to avoid locking everyone out
    // but log it privately if possible.
    next();
  }
};
