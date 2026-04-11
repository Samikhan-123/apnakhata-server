import prisma from '../../config/prisma.js';
import auditService from './audit.service.js';

export class AdminService {
  /**
   * Get system-wide statistics
   */
  async getSystemStats() {
    const [totalUsers, totalEntries, totalAmount, totalLogs] = await Promise.all([
      prisma.user.count(),
      prisma.ledgerEntry.count(),
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true }
      }),
      prisma.adminLog.count()
    ]);

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Get User Trends (Last 6 Months)
    const userTrends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthDate,
            lt: nextMonthDate
          }
        }
      });
      
      userTrends.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        count
      });
    }

    return {
      totalUsers,
      totalEntries,
      totalVolume: Number(totalAmount._sum.amount || 0),
      newUsersLast30Days,
      userTrends,
      totalLogs
    };
  }

  /**
   * Get all users with basic info and pagination
   */
  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          isActive: true,
          googleId: true,
          password: true,
          createdAt: true,
          _count: {
            select: {
              ledgerEntries: true,
              categories: true,
              budgets: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Update user role, verification status, or account status
   */
  async updateUser(adminId: string, id: string, data: { role?: 'ADMIN' | 'USER', isVerified?: boolean, isActive?: boolean }) {
    // strict check: google users cannot be unverified
    if (data.isVerified === false) {
      const user = await prisma.user.findUnique({ where: { id }, select: { googleId: true } });
      if (user?.googleId) {
        throw new Error('Google users are automatically verified and cannot be unverified.');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    // Determine the action for logging
    let action = 'UPDATE_USER';
    if (data.isActive === false) action = 'BAN_USER';
    else if (data.isActive === true) action = 'REACTIVATE_USER';
    else if (data.role === 'ADMIN') action = 'PROMOTE_ADMIN';
    else if (data.role === 'USER') action = 'DEMOTE_USER';
    else if (data.isVerified !== undefined) action = data.isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER';

    await auditService.log(adminId, action, id, data);

    return updatedUser;
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserDetails(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ledgerEntries: true,
            categories: true,
            budgets: true,
            recurringEntries: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get last 5 transactions
    const recentActivity = await prisma.ledgerEntry.findMany({
      where: { userId: id },
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true }
    });

    return {
      ...user,
      recentActivity
    };
  }
}

export default new AdminService();
