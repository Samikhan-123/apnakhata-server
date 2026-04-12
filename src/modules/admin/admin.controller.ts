import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import adminService from './admin.service.js';
import auditService from './audit.service.js';
import { COOKIE_OPTIONS } from '../auth/auth.controller.js';

export class AdminController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getSystemStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await adminService.getAllUsers(page, limit);
      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { role, isVerified, isActive } = req.body;
      const adminId = req.user.id;
      const user = await adminService.updateUser(adminId, id, { role, isVerified, isActive });
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async batchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ids, data } = req.body;
      const adminId = req.user.id;
      const result = await adminService.batchUpdateUsers(adminId, ids, data);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Successfully updated ${result.count} users`
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await adminService.getUserDetails(id);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;
      
      const { adminId, action, targetId, startDate, endDate, search } = req.query;

      const result = await auditService.getLogs(page, limit, {
        adminId: adminId as string,
        action: action as string,
        targetId: targetId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getFinancialStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async scheduleDeletion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user.id;
      const user = await adminService.scheduleUserDeletion(adminId, id);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Account scheduled for deletion in 30 days.'
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelDeletion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user.id;
      const user = await adminService.cancelUserDeletion(adminId, id);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Scheduled deletion cancelled. Account restored.'
      });
    } catch (error) {
      next(error);
    }
  }

  async impersonate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminId = req.user.id;
      const result = await adminService.impersonateUser(adminId, id);
      
      res.cookie('token', result.token, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        data: result,
        message: `Impersonation session started for ${result.user.name}`
      });
    } catch (error) {
      next(error);
    }
  }

  async stopImpersonate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const impersonatorId = req.impersonatorId;
      if (!impersonatorId) throw new Error('No active impersonation session found.');

      const result = await adminService.stopImpersonation(impersonatorId);
      
      res.cookie('token', result.token, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Impersonation stopped. Staff session restored.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
