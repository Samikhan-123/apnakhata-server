import prisma from '../../config/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';
import logger from '../../utils/logger.js';
import * as Sentry from '@sentry/node';

export class AuditService {
  /**
   * Log an administrative action
   */
  async log(adminId: string, action: string, targetId?: string, details?: any) {
    if (!adminId || !action) {
      logger.warn('[AUDIT] Attempted to log without adminId or action');
      return;
    }

    try {
      await (prisma as any).adminLog.create({
        data: {
          adminId,
          action,
          targetId,
          details: details ? details : undefined
        }
      });
    } catch (error) {
      logger.error('Failed to log admin action', { error, adminId, action });
      Sentry.captureException(error);
    }
  }

  /**
   * Get audit logs with pagination
   */
  async getLogs(page: number = 1, limit: number = 15) {
    // Basic pagination safety
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    try {
      const [logs, totalCount] = await Promise.all([
        (prisma as any).adminLog.findMany({
          skip,
          take: safeLimit,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: { id: true, name: true, email: true }
            },
            target: {
              select: { id: true, name: true, email: true }
            }
          }
        }),
        (prisma as any).adminLog.count()
      ]);

      return {
        logs,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / safeLimit),
          currentPage: safePage,
          limit: safeLimit
        }
      };
    } catch (error) {
      throw new AppError('Failed to retrieve audit logs from database', 500, error);
    }
  }
}

export default new AuditService();
