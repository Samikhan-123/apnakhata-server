import prisma from '../../config/prisma.js';
import { CreateLedgerEntryInput, UpdateLedgerEntryInput, LedgerEntryFilters } from './ledger-entry.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';
import ledgerEntryRepository from './ledger-entry.repository.js';
import { auditLog } from '../../utils/logger.js';

export class LedgerEntryService {
  /**
   * Create a new ledger entry
   */
  async create(userId: string, data: CreateLedgerEntryInput) {
    // Income First Rule: Cannot add expense if balance is insufficient
    if (data.type === 'EXPENSE') {
      const summary = await ledgerEntryRepository.getFinancialSummary(userId);
      if (summary.totalIncome <= 0) {
        throw new AppError('Please add your income first to start recording expenses.', 400);
      }
      if (summary.remainingBalance < data.amount) {
        throw new AppError(`Insufficient funds. Your current balance is ${summary.remainingBalance}, but this expense is ${data.amount}.`, 400);
      }
    }

    // Enforce 3-Month Window for creation
    this.validateDateWindow(new Date(data.date || new Date()));

    // Standard income/expense entry. Normalized to lowercase.
    return await ledgerEntryRepository.create(userId, {
      ...data,
      description: data.description.toLowerCase()
    });
  }

  /**
   * List all ledger entries for a user with filters
   */
  async getAll(userId: string, filters: LedgerEntryFilters) {
    return await ledgerEntryRepository.findAll(userId, filters);
  }

  /**
   * Get a single ledger entry by ID
   */
  async getById(userId: string, id: string) {
    const entry = await ledgerEntryRepository.findById(id, userId);
    if (!entry) {
      throw new AppError('Ledger entry not found', 404);
    }
    return entry;
  }

  /**
   * Enforces the "3-Month Hybrid Rule" (Previous, Current, and Next month window)
   * This ensures data outside this strictly audited window is hardened.
   */
  private validateDateWindow(date: Date) {
    const now = new Date();
    
    // 1. Current Month Boundary
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 2. Window Calculation
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    // Calculate absolute month indices for comparison (Year * 12 + Month)
    const nowIdx = (currentYear * 12) + currentMonth;
    const targetIdx = (targetYear * 12) + targetMonth;

    // Allowed window: [Now-1, Now, Now+1]
    const diff = targetIdx - nowIdx;

    if (diff < -1 || diff > 1) {
      throw new AppError('Date is outside the allowed auditing window (Previous, Current, or Next month only).', 400);
    }
  }

  /**
   * Delete a ledger entry
   */
  async delete(userId: string, id: string) {
    const entry = await ledgerEntryRepository.findById(id, userId);
    if (!entry) {
      throw new AppError('Ledger entry not found', 404);
    }
    
    // Enforce 3-Month Window for deletion
    this.validateDateWindow(new Date(entry.date));

    await ledgerEntryRepository.delete(id, userId);
    auditLog('LEDGER_ENTRY_DELETE', userId, { entryId: id, amount: entry.amount, type: entry.type });
    return { success: true };
  }

  /**
   * Update a ledger entry
   */
  async update(userId: string, id: string, data: UpdateLedgerEntryInput) {
    const existingEntry = await ledgerEntryRepository.findById(id, userId);
    if (!existingEntry) {
      throw new AppError('Ledger entry not found', 404);
    }

    // Enforce 3-Month Window for update (Existing Date)
    this.validateDateWindow(new Date(existingEntry.date));

    // Enforce 3-Month Window for update (New Date if being changed)
    if (data.date) {
      this.validateDateWindow(new Date(data.date));
    }

    // Income First Rule for Updates
    const newType = data.type || existingEntry.type;
    const newAmount = data.amount || Number(existingEntry.amount);
    
    if (newType === 'EXPENSE') {
      const summary = await ledgerEntryRepository.getFinancialSummary(userId);
      // Adjust balance by adding back the old amount if it was an expense
      const oldAmount = existingEntry.type === 'EXPENSE' ? Number(existingEntry.amount) : 0;
      const adjustedBalance = summary.remainingBalance + oldAmount;
      
      if (summary.totalIncome <= 0 && existingEntry.type !== 'INCOME') {
        throw new AppError('Please add your income first to start recording expenses.', 400);
      }
      
      if (adjustedBalance < newAmount) {
        throw new AppError(`Insufficient funds. Your available balance (adjusting for this entry) is ${adjustedBalance}, but the new amount is ${newAmount}.`, 400);
      }
    }

    return await prisma.ledgerEntry.update({
      where: { id },
      data: {
        ...(data.amount && { amount: data.amount }),
        ...(data.description && { description: data.description.toLowerCase() }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.type && { type: data.type }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
      include: {
        category: true,
      }
    });
  }

  /**
   * Financial Summary (Filtered or All-time)
   */
  async getOverview(userId: string, filters?: { startDate?: string; endDate?: string }) {
    return await ledgerEntryRepository.getFinancialSummary(userId, filters);
  }

  async getDashboardStats(userId: string, filters: any = {}) {
    const { startDate, endDate } = filters;
    const now = new Date();
    
    // 1. OVERVIEW DATES (Strictly based on User Filters)
    const overview = await ledgerEntryRepository.getFinancialSummary(userId, filters);

    // 2. TREND DATES (Expanded to 12 Months to support 1Y frontend toggle)
    const trendStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    trendStartDate.setHours(0, 0, 0, 0);
    const trendEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch data for Category Breakdown (based on current window/filters)
    const categoryEntries = await prisma.ledgerEntry.findMany({
      where: {
        userId,
        date: { 
          gte: startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1),
          lte: endDate ? new Date(endDate) : now
        },
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.search && {
          description: { contains: filters.search, mode: 'insensitive' }
        })
      },
      include: { category: true }
    });

    // Fetch data for Trends (Fixed 6-month window)
    const trendEntries = await prisma.ledgerEntry.findMany({
      where: {
        userId,
        date: { gte: trendStartDate, lte: trendEndDate }
      },
      include: { category: true }
    });

    const recentEntries = await prisma.ledgerEntry.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5
    });

    const categoryMap = new Map<string, number>();
    categoryEntries.filter((e: any) => e.type === 'EXPENSE').forEach((entry: any) => {
      const catName = entry.category?.name || 'uncategorized';
      const catAmount = Number(entry.amount);
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + catAmount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

    // Monthly Trends Calculation
    const monthlyTrendsMap = new Map();
    let iterDate = new Date(trendStartDate);
    while (iterDate <= trendEndDate) {
      const key = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
      const yearShort = String(iterDate.getFullYear()).slice(-2);
      monthlyTrendsMap.set(key, { 
        month: `${iterDate.toLocaleString('default', { month: 'short' })} '${yearShort}`, 
        income: 0, 
        expense: 0,
        balance: 0
      });
      iterDate.setMonth(iterDate.getMonth() + 1);
    }

    // Cumulative balance for Trends
    const beforeStats = await prisma.ledgerEntry.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { lt: trendStartDate }
      },
      _sum: { amount: true }
    });

    let currentBalance = Number(beforeStats.find((s: any) => s.type === 'INCOME')?._sum.amount || 0) - 
                         Number(beforeStats.find((s: any) => s.type === 'EXPENSE')?._sum.amount || 0);

    const sortedTrendEntries = [...trendEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const keys = Array.from(monthlyTrendsMap.keys());
    
    keys.forEach(key => {
      const stats = monthlyTrendsMap.get(key);
      const monthEntries = sortedTrendEntries.filter(e => {
        const eKey = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
        return eKey === key;
      });

      monthEntries.forEach(e => {
        const amt = Number(e.amount);
        if (e.type === 'INCOME') {
          stats.income += amt;
          currentBalance += amt;
        } else {
          stats.expense += amt;
          currentBalance -= amt;
        }
      });
      stats.balance = currentBalance;
    });

    return {
      overview: {
        ...overview,
        balance: overview.remainingBalance
      },
      recentEntries: recentEntries.map((e: any) => ({
          ...e,
          description: e.description,
          category: e.category ? { ...e.category, name: e.category.name } : null
      })),
      categoryBreakdown,
      monthlyTrends: Array.from(monthlyTrendsMap.values()) // Keep chronological for charts
    };
  }

  async getStats(userId: string, filters: any = {}) {
    return this.getDashboardStats(userId, filters);
  }
}

export default new LedgerEntryService();
