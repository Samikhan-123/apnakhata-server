import prisma from '../../config/prisma.js';
import auditService from './audit.service.js';

export class AdminService {
  /**
   * Get system-wide statistics
   */
  async getSystemStats() {
    const [totalUsers, statsByType, totalLogs] = await Promise.all([
      prisma.user.count(),
      (prisma.ledgerEntry as any).groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.adminLog.count()
    ]);

    const incomeStats = statsByType.find((s: any) => s.type === 'INCOME') || { _sum: { amount: 0 }, _count: { id: 0 } };
    const expenseStats = statsByType.find((s: any) => s.type === 'EXPENSE') || { _sum: { amount: 0 }, _count: { id: 0 } };

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
      totalEntries: incomeStats._count.id + expenseStats._count.id,
      incomeVolume: Number(incomeStats._sum.amount || 0),
      expenseVolume: Number(expenseStats._sum.amount || 0),
      incomeCount: incomeStats._count.id,
      expenseCount: expenseStats._count.id,
      totalVolume: Number(incomeStats._sum.amount || 0) + Number(expenseStats._sum.amount || 0),
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
   * Batch update multiple users
   */
  async batchUpdateUsers(adminId: string, ids: string[], data: { role?: 'ADMIN' | 'USER', isVerified?: boolean, isActive?: boolean }) {
    if (!ids || ids.length === 0) throw new Error('No user IDs provided');

    // Safety: check if any of these are google users before unverifying
    if (data.isVerified === false) {
      const googleUsers = await prisma.user.count({
        where: {
          id: { in: ids },
          googleId: { not: null }
        }
      });
      if (googleUsers > 0) {
        throw new Error(`Cannot unverify ${googleUsers} Google-authenticated accounts in this batch.`);
      }
    }

    const result = await prisma.user.updateMany({
      where: { id: { in: ids } },
      data
    });

    // Determine the action for logging
    let action = 'BATCH_UPDATE_USERS';
    if (data.isActive === false) action = 'BATCH_BAN_USERS';
    else if (data.isActive === true) action = 'BATCH_REACTIVATE_USERS';
    else if (data.role) action = 'BATCH_ROLE_CHANGE';
    else if (data.isVerified !== undefined) action = 'BATCH_VERIFY_USERS';

    await auditService.log(adminId, action, 'SYSTEM_BATCH', { count: result.count, data, targetedIds: ids });

    return result;
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

  /**
   * Get advanced financial and system analytics
   */
  /**
   * Get advanced financial and system analytics
   */
  async getFinancialStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Get Daily Volume Trends (Last 30 Days) - Group by Date and Type
    const dailyStats = await (prisma.ledgerEntry as any).groupBy({
      by: ['date', 'type'],
      where: {
        date: { gte: thirtyDaysAgo }
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { date: 'asc' }
    });

    // Map into daily objects with income/expense buckets
    const trendsMap: Record<string, { date: string, income: number, expense: number, count: number }> = {};
    
    dailyStats.forEach((stat: any) => {
      const d = stat.date.toISOString().split('T')[0];
      if (!trendsMap[d]) {
        trendsMap[d] = { date: d, income: 0, expense: 0, count: 0 };
      }
      if (stat.type === 'INCOME') trendsMap[d].income = Number(stat._sum.amount || 0);
      else if (stat.type === 'EXPENSE') trendsMap[d].expense = Number(stat._sum.amount || 0);
      trendsMap[d].count += stat._count.id;
    });

    const volumeTrends = Object.values(trendsMap).sort((a,b) => a.date.localeCompare(b.date));

    // 2. Category Breakdown (Platform Wide) - Group by both Category and Type
    const categoryDistribution = await (prisma.ledgerEntry as any).groupBy({
      by: ['categoryId', 'type'],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: {
        _sum: { amount: 'desc' }
      },
      take: 15
    });

    const categoryIds = categoryDistribution.map((c: any) => c.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true }
    });

    const distribution = categoryDistribution.map((stat: any) => {
      const cat = categories.find(c => c.id === stat.categoryId);
      return {
        name: cat?.name || 'Uncategorized',
        icon: cat?.icon || 'Package',
        value: Number(stat._sum.amount || 0),
        count: stat._count.id,
        type: stat.type
      };
    });

    // 3. Currency Distribution (User Preferences)
    const currencyDistribution = await (prisma.user as any).groupBy({
      by: ['baseCurrency'],
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    const currencies = currencyDistribution.map((stat: any) => ({
      currency: stat.baseCurrency,
      userCount: stat._count.id
    }));

    // 4. User Activity (Daily Active Users)
    const dauStats = await (prisma.ledgerEntry as any).groupBy({
      by: ['date', 'userId'],
      where: { date: { gte: thirtyDaysAgo } }
    });

    const dauMap: Record<string, Set<string>> = {};
    dauStats.forEach((stat: any) => {
      const d = stat.date.toISOString().split('T')[0];
      if (!dauMap[d]) dauMap[d] = new Set();
      dauMap[d].add(stat.userId);
    });

    const activityTrends = Object.entries(dauMap).map(([date, users]) => ({
      date,
      count: users.size
    })).sort((a,b) => a.date.localeCompare(b.date));

    return {
      volumeTrends,
      categoryDistribution: distribution,
      currencyDistribution: currencies,
      activityTrends,
      summary: {
        totalIncome: volumeTrends.reduce((acc, curr) => acc + curr.income, 0),
        totalExpense: volumeTrends.reduce((acc, curr) => acc + curr.expense, 0),
        avgTransaction: dailyStats.length > 0 
          ? Number(dailyStats.reduce((acc: any, s: any) => acc + Number(s._sum.amount), 0) / dailyStats.reduce((acc: any, s: any) => acc + s._count.id, 0))
          : 0,
        peakVolumeDate: dailyStats.reduce((prev: any, current: any) => (Number(prev?._sum?.amount || 0) > Number(current._sum?.amount || 0)) ? prev : current, dailyStats[0])?.date
      }
    };
  }
}

export default new AdminService();
