import prisma from "../../config/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import logger from "../../utils/logger.js";
import * as Sentry from "@sentry/node";

export class AuditService {
  /**
   * Log an administrative action
   */
  async log(
    adminId: string | null,
    action: string,
    targetId?: string,
    details?: any,
  ) {
    if (!action) {
      logger.warn("[AUDIT] Attempted to log without action");
      return;
    }

    try {
      await (prisma as any).adminLog.create({
        data: {
          adminId: adminId || null,
          action,
          targetId,
          details: details ? details : undefined,
        },
      });
    } catch (error) {
      logger.error("Failed to log admin action", { error, adminId, action });
      Sentry.captureException(error);
    }
  }

  /**
   * Get audit logs with pagination and dynamic filtering
   */
  async getLogs(
    page: number = 1,
    limit: number = 15,
    filters: {
      adminId?: string;
      action?: string;
      targetId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    } = {},
  ) {
    // 1. Basic pagination safety
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    // 2. Build dynamic where clause
    const where: any = {};
    if (filters.adminId) where.adminId = filters.adminId;
    if (filters.action) where.action = filters.action;
    if (filters.targetId) where.targetId = filters.targetId;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      where.OR = [
        { admin: { email: { contains: searchTerm, mode: "insensitive" } } },
        { admin: { name: { contains: searchTerm, mode: "insensitive" } } },
        { target: { email: { contains: searchTerm, mode: "insensitive" } } },
        { target: { name: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); // Inclusion of the entire end day
        where.createdAt.lte = end;
      }
    }

    try {
      const [logs, total] = await Promise.all([
        (prisma as any).adminLog.findMany({
          where,
          skip,
          take: safeLimit,
          orderBy: { createdAt: "desc" },
          include: {
            admin: {
              select: { id: true, name: true, email: true },
            },
            target: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        (prisma as any).adminLog.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          total,
          totalPages: Math.ceil(total / safeLimit),
          page: safePage,
          limit: safeLimit,
        },
      };
    } catch (error) {
      throw new AppError(
        "Failed to retrieve audit logs from database",
        500,
        error,
      );
    }
  }
}

export default new AuditService();
