import { UserRole } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { generateToken } from '../../utils/auth.js';
import auditService from './audit.service.js';

export class AdminService {
  /**
   * Get system-wide statistics
   */
  async getSystemStats() {
    const [totalUsers, statsByType, totalLogs, activeBudgets, activeRecurring, systemCategories] = await Promise.all([
      prisma.user.count(),
      (prisma.ledgerEntry as any).groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.adminLog.count(),
      prisma.budget.count(),
      prisma.recurringEntry.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isSystem: true } })
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
      totalLogs,
      activeBudgets,
      activeRecurring,
      systemCategories
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
          lastIp: true,
          lastLocation: true,
          lastDevice: true,
          metadata: true,
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
  async updateUser(adminId: string, id: string, data: { role?: UserRole, isVerified?: boolean, isActive?: boolean }) {
    // 1. Policy Check: Fetch acting admin and target user
    const [actingAdmin, targetUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: adminId }, select: { role: true } }),
      prisma.user.findUnique({ where: { id }, select: { role: true, googleId: true } })
    ]);

    const isSuperAdmin = actingAdmin?.role === UserRole.ADMIN;

    // 2. Admin Protection: No one can modify another ADMIN
    if (targetUser?.role === UserRole.ADMIN && id !== adminId) {
      throw new Error('Forbidden: Administrative accounts are protected. You cannot modify another Administrator.');
    }

    // 3. Self-Protection: Admins cannot ban, unverify, or demote themselves
    if (id === adminId) {
      if (data.role || data.isActive === false || data.isVerified === false) {
        throw new Error('Forbidden: You cannot ban, unverify, or change your own role. Please ask another Administrator if this is required.');
      }
    }

    // 3. Role Change Protection: Only ADMINs can change roles
    if (data.role && !isSuperAdmin) {
      throw new Error('Forbidden: Moderators are not authorized to change user roles.');
    }

    // 3. Status Change Protection: Moderators cannot ban Admins or other Moderators
    if (data.isActive === false && !isSuperAdmin) {
       if (targetUser?.role === UserRole.ADMIN || (targetUser?.role as any) === 'MODERATOR') {
          throw new Error('Forbidden: Moderators cannot deactivate other staff members.');
       }
    }

    // 4. Verification Check: Google users cannot be unverified
    if (data.isVerified === false && targetUser?.googleId) {
       throw new Error('Google users are automatically verified and cannot be unverified.');
    }

    // 5. Promotion Lockdown: Admins cannot create other Admins via the dashboard
    if ((data.role as any) === UserRole.ADMIN) {
      throw new Error('Forbidden: Administrative privileges can only be provisioned via direct system access for security integrity.');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: data as any
    });

    // Determine the action for logging
    let action = 'UPDATE_USER';
    if (data.isActive === false) action = 'BAN_USER';
    else if (data.isActive === true) action = 'REACTIVATE_USER';
    else if (data.role === UserRole.ADMIN) action = 'PROMOTE_ADMIN';
    else if ((data.role as any) === 'MODERATOR') action = 'PROMOTE_MODERATOR';
    else if (data.role === UserRole.USER) action = 'DEMOTE_USER';
    else if (data.isVerified !== undefined) action = data.isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER';

    await auditService.log(adminId, action, id, data);

    return updatedUser;
  }

  /**
   * Batch update multiple users
   */
  async batchUpdateUsers(adminId: string, ids: string[], data: { role?: UserRole, isVerified?: boolean, isActive?: boolean }) {
    if (!ids || ids.length === 0) throw new Error('No user IDs provided');

    // 1. Policy Check: Fetch acting admin
    const actingAdmin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    const isSuperAdmin = actingAdmin?.role === UserRole.ADMIN;

    // 2. Role Change Protection: Batch role changes are ADMIN only
    if (data.role && !isSuperAdmin) {
      throw new Error('Forbidden: Batch role modifications are restricted to full Administrators.');
    }

    // 2b. Promotion Lockdown: Admins cannot create other Admins via the dashboard
    if ((data.role as any) === UserRole.ADMIN) {
      throw new Error('Forbidden: Batch promotion to Administrator is strictly prohibited via the dashboard.');
    }

    // 3. Admin Protection: Batch updates cannot include other ADMINs
    const adminTargets = await prisma.user.count({
      where: {
        id: { in: ids },
        role: UserRole.ADMIN,
        NOT: { id: adminId } // Exclude self if they somehow selected themselves
      }
    });
    if (adminTargets > 0) {
      throw new Error(`Forbidden: You cannot perform batch actions on ${adminTargets} other Administrators.`);
    }

    if (ids.includes(adminId)) {
      throw new Error('Forbidden: You cannot include yourself in a batch administrative action.');
    }

    // 4. Protection: Moderators cannot batch-deactivate/ban anyone if the list contains staff
    if (data.isActive === false && !isSuperAdmin) {
      const moderatorCount = await prisma.user.count({
        where: {
          id: { in: ids },
          role: 'MODERATOR' as any
        }
      });
      if (moderatorCount > 0) {
        throw new Error(`Forbidden: You cannot deactivate ${moderatorCount} staff members in this batch.`);
      }
    }

    // 4. Verification Check: No un-verifying Google users
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

    await auditService.log(adminId, action, undefined, { count: result.count, data, targetedIds: ids });

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

    // Get last 5 Records
    const recentActivity = await prisma.ledgerEntry.findMany({
      where: { userId: id },
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true }
    });

    // Calculate Risk Profile
    const riskProfile = this.calculateRiskProfile(user);

    return {
      ...user,
      recentActivity,
      riskProfile
    };
  }

  /**
   * Calculate a security risk profile for a user based on technical metadata
   */
  private calculateRiskProfile(user: any) {
    let score = 100;
    const signals: { type: 'TRUST' | 'RISK' | 'INFO', message: string, impact: number }[] = [];

    // 1. Identity Verification
    if (!user.isVerified) {
      const impact = -20;
      score += impact;
      signals.push({ type: 'RISK', message: 'Identity not verified via email', impact });
    } else {
      signals.push({ type: 'TRUST', message: 'Email identity verified', impact: 0 });
    }

    // 2. Authentication Method
    if (user.googleId) {
      const impact = 15;
      score += impact;
      signals.push({ type: 'TRUST', message: 'Verified Google OAuth entry point', impact });
    }

    // 3. Network Reputation (Hostname analysis)
    const hostname = user.metadata?.hostname?.toLowerCase() || '';
    const riskyProviders = ['ovh', 'digitalocean', 'aws', 'amazon', 'googlecloud', 'azure', 'vultr', 'linode', 'proxy', 'vpn'];
    const isRiskyHost = riskyProviders.some(p => hostname.includes(p));

    if (isRiskyHost) {
       const impact = -30;
       score += impact;
       signals.push({ type: 'RISK', message: 'Data Center / VPN connection detected', impact });
    } else if (hostname) {
       signals.push({ type: 'INFO', message: `Residential/ISP connection: ${hostname.split('.').slice(-2).join('.')}`, impact: 0 });
    }

    // 4. Activity Volume
    const entriesCount = user._count?.ledgerEntries || 0;
    if (entriesCount > 500 && !user.isVerified) {
       const impact = -20;
       score += impact;
       signals.push({ type: 'RISK', message: 'High activity volume from unverified account', impact });
    }

    // Normalize score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine Level and Recommendation
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let recommendation = 'Safe: No immediate administrative action required. Standard monitoring active.';

    if (score < 40) {
      level = 'HIGH';
      recommendation = 'Critical: High risk signals detected. Review recent activity immediately and consider a temporary ban while investigating.';
    } else if (score < 75) {
      level = 'MEDIUM';
      recommendation = 'Watchlist: Suspicious metadata detected (VPN or Unverified status). Monitor for impossible travel or multi-account abuse.';
    }

    return {
      score,
      level,
      recommendation,
      signals
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

    // 4. Platform Activity (Signups & DAU) - Last 7 Days with 0-padding
    const activitySummaryMap: Record<string, { signups: number, activeUsers: number }> = {};
    const sevenDaysAgoForActivity = new Date();
    sevenDaysAgoForActivity.setDate(sevenDaysAgoForActivity.getDate() - 7);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activitySummaryMap[d.toISOString().split('T')[0]] = { signups: 0, activeUsers: 0 };
    }

    // Signups
    const dailySignups = await (prisma.user as any).groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgoForActivity } },
      _count: { id: true }
    });
    dailySignups.forEach((s: any) => {
      const d = s.createdAt.toISOString().split('T')[0];
      if (activitySummaryMap[d]) activitySummaryMap[d].signups = s._count.id;
    });

    // DAU (Daily Active Users based on session activity/ledger entries)
    const dauStats = await (prisma.ledgerEntry as any).groupBy({
      by: ['date', 'userId'],
      where: { date: { gte: sevenDaysAgoForActivity } }
    });
    const dailyUniqueUsers: Record<string, Set<string>> = {};
    dauStats.forEach((s: any) => {
      const d = s.date.toISOString().split('T')[0];
      if (!dailyUniqueUsers[d]) dailyUniqueUsers[d] = new Set();
      dailyUniqueUsers[d].add(s.userId);
    });
    Object.entries(dailyUniqueUsers).forEach(([date, users]) => {
      if (activitySummaryMap[date]) activitySummaryMap[date].activeUsers = users.size;
    });

    const activityTrends = Object.entries(activitySummaryMap).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
      signups: data.signups,
      activeUsers: data.activeUsers
    }));

    // 5. Top Active Users (Most transactions in last 30 days)
    const topUsers = await (prisma.ledgerEntry as any).groupBy({
      by: ['userId'],
      _count: { id: true },
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const topUserIds = topUsers.map((u: any) => u.userId);
    const topUsersDetails = await prisma.user.findMany({
       where: { id: { in: topUserIds } },
       select: { id: true, name: true, email: true, image: true }
    });

    const topActiveUsers = topUsers.map((u: any) => {
       const details = topUsersDetails.find(d => d.id === u.userId);
       return {
          ...details,
          activityCount: u._count.id
       };
    });

    return {
      volumeTrends,
      categoryDistribution: distribution,
      currencyDistribution: currencies,
      activityTrends,
      topActiveUsers,
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

  /**
   * Schedule a user for deletion (30 days grace period)
   */
  async scheduleUserDeletion(adminId: string, id: string) {
    const actingAdmin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });

    if (actingAdmin?.role !== UserRole.ADMIN) {
      throw new Error('Forbidden: Only full Administrators can schedule account deletions.');
    }

    if (targetUser?.role === UserRole.ADMIN && id !== adminId) {
       throw new Error('Forbidden: Administrative accounts are protected. You cannot delete another Administrator.');
    }

    if (id === adminId) {
      throw new Error('Forbidden: You cannot schedule your own account for deletion. This protection prevents accidental system lockout.');
    }

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletionScheduledAt: deletionDate,
        deletionRequestedBy: UserRole.ADMIN
      }
    });

    await auditService.log(adminId, 'SCHEDULE_DELETION', id, { deletionDate });

    return updatedUser;
  }

  /**
   * Cancel a scheduled account deletion
   */
  async cancelUserDeletion(adminId: string, id: string) {
    const actingAdmin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    
    if (actingAdmin?.role !== UserRole.ADMIN) {
      throw new Error('Forbidden: Only full Administrators can cancel account deletions.');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletionScheduledAt: null,
        deletionRequestedBy: null
      }
    });

    await auditService.log(adminId, 'CANCEL_DELETION', id);

    return updatedUser;
  }

  /**
   * Run administrative maintenance cleanup (Wipe accounts & Purge logs)
   * This is called by the unified maintenance controller/cron.
   */
  async runMaintenanceCleanup() {
    const now = new Date();
    const results = { accountsPurged: 0, logsPurged: 0 };

    // 1. Permanent Account Deletion (30-day grace period passed)
    const accountsToPurge = await prisma.user.findMany({
      where: {
        deletionScheduledAt: {
          lt: now
        }
      },
      select: { id: true, email: true }
    });

    if (accountsToPurge.length > 0) {
      for (const account of accountsToPurge) {
        // Cascade deletion is handled by Prisma (onDelete: Cascade in schema)
        await prisma.user.delete({ where: { id: account.id } });
      }
      results.accountsPurged = accountsToPurge.length;
    }

    // 2. Audit Log Purge (90-day retention policy)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedLogs = await prisma.adminLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });
    results.logsPurged = deletedLogs.count;

    return results;
  }

  /**
   * Enter a user or moderator dashboard in Read-Only diagnostic mode
   */
  async impersonateUser(adminId: string, targetUserId: string) {
    // 1. Policy Check: Only full Administrators can impersonate
    const actingAdmin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (actingAdmin?.role !== UserRole.ADMIN) {
      throw new Error('Forbidden: Impersonation privileges are restricted to platform Administrators.');
    }

    // 2. Target Check: Admins cannot impersonate themselves or other Admins
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, role: true, name: true, email: true } });
    if (!targetUser) throw new Error('Target user not found');

    if (targetUser.role === UserRole.ADMIN) {
      throw new Error('Forbidden: Security protocols prohibit impersonating other Administrative accounts.');
    }

    // 3. Generate Impersonation Token
    // We add 'impersonatorId' which the client will use to show the Read-Only banner
    const token = generateToken(targetUser.id, { 
      impersonatorId: adminId,
      isReadOnly: true 
    });

    // 4. Audit Trail
    await auditService.log(adminId, 'START_IMPERSONATION', targetUserId, { targetName: targetUser.name, targetEmail: targetUser.email });

    return {
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    };
  }

  /**
   * Stop impersonation and return to the original Administrator session
   */
  async stopImpersonation(impersonatorId: string) {
    if (!impersonatorId) {
      throw new Error('No active impersonation session found to stop.');
    }

    const admin = await prisma.user.findUnique({ 
      where: { id: impersonatorId },
      select: { id: true, role: true, name: true, email: true }
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new Error('Forbidden: Original session context is invalid or lacks administrative privileges.');
    }

    // Generate fresh token for the Admin
    const token = generateToken(admin.id);

    // Audit Trail
    await auditService.log(admin.id, 'STOP_IMPERSONATION');

    return {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    };
  }
}

export default new AdminService();
