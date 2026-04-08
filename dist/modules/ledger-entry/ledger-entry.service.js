import prisma from '../../config/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';
import ledgerEntryRepository from './ledger-entry.repository.js';
import { auditLog } from '../../utils/logger.js';
export class LedgerEntryService {
    /**
     * Create a new ledger entry
     */
    async create(userId, data) {
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
        // Income limit removed to support daily/weekly earners. Focus is on total monthly liquidity.
        // Standard income/expense entry. Normalized to lowercase.
        return await ledgerEntryRepository.create(userId, data);
    }
    /**
     * List all ledger entries for a user with filters
     */
    async getAll(userId, filters) {
        return await ledgerEntryRepository.findAll(userId, filters);
    }
    /**
     * Get a single ledger entry by ID
     */
    async getById(userId, id) {
        const entry = await ledgerEntryRepository.findById(id, userId);
        if (!entry) {
            throw new AppError('Ledger entry not found', 404);
        }
        return entry;
    }
    /**
     * Delete a ledger entry
     */
    async delete(userId, id) {
        const entry = await ledgerEntryRepository.findById(id, userId);
        if (!entry) {
            throw new AppError('Ledger entry not found', 404);
        }
        // No audit protection rule for now, simple deletion as per user's "single source" request?
        // User didn't specify blocking delete here, but previously they wanted categories locked.
        // I'll keep the income-entry lock for now as it's a good practice unless asked otherwise.
        if (entry.type === 'INCOME') {
            throw new AppError('Income entries are permanent for audit integrity.', 400);
        }
        await ledgerEntryRepository.delete(id, userId);
        auditLog('LEDGER_ENTRY_DELETE', userId, { entryId: id, amount: entry.amount, type: entry.type });
        return { success: true };
    }
    /**
     * Update a ledger entry
     */
    async update(userId, id, data) {
        const existingEntry = await ledgerEntryRepository.findById(id, userId);
        if (!existingEntry) {
            throw new AppError('Ledger entry not found', 404);
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
        // Rule: Salary entries (salary/job) can only be edited within their specific month
        const isSalary = existingEntry.description.toLowerCase() === 'salary';
        if (isSalary) {
            const now = new Date();
            const entryDate = new Date(existingEntry.date);
            if (entryDate.getMonth() !== now.getMonth() || entryDate.getFullYear() !== now.getFullYear()) {
                throw new AppError('Salary records from previous months are locked for audit integrity.', 400);
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
    async getOverview(userId, filters) {
        return await ledgerEntryRepository.getFinancialSummary(userId, filters);
    }
    async getDashboardStats(userId, filters = {}) {
        const { startDate, endDate } = filters;
        const now = new Date();
        // Default window for trends if no dates provided
        const trendStartDate = startDate ? new Date(startDate) : new Date(new Date().setMonth(now.getMonth() - 5));
        if (!startDate)
            trendStartDate.setDate(1);
        trendStartDate.setHours(0, 0, 0, 0);
        const trendEndDate = endDate ? new Date(endDate) : now;
        if (endDate)
            trendEndDate.setHours(23, 59, 59, 999);
        // 1. COMPREHENSIVE SUMMARY (All-time or Filtered)
        const overview = await ledgerEntryRepository.getFinancialSummary(userId, filters);
        // 2. FETCH DATA FOR TRENDS
        const entries = await prisma.ledgerEntry.findMany({
            where: {
                userId,
                date: { gte: trendStartDate, lte: trendEndDate },
                ...(filters.categoryId && { categoryId: filters.categoryId }),
                ...(filters.search && {
                    description: { contains: filters.search, mode: 'insensitive' }
                })
            },
            include: { category: true }
        });
        const recentEntries = await prisma.ledgerEntry.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' },
            take: 5
        });
        // Category Breakdown (based on current window/filters)
        const categoryMap = new Map();
        entries.filter((e) => e.type === 'EXPENSE').forEach((entry) => {
            const catName = entry.category?.name || 'uncategorized';
            const catAmount = Number(entry.amount);
            categoryMap.set(catName, (categoryMap.get(catName) || 0) + catAmount);
        });
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
        // Monthly Trends
        const monthlyTrendsMap = new Map();
        // Generate months between trendStartDate and trendEndDate
        let iterDate = new Date(trendStartDate);
        while (iterDate <= trendEndDate) {
            const key = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
            monthlyTrendsMap.set(key, {
                month: iterDate.toLocaleString('default', { month: 'short' }),
                income: 0,
                expense: 0,
                balance: 0
            });
            iterDate.setMonth(iterDate.getMonth() + 1);
        }
        // Cumulative balance calculation
        const beforeStats = await prisma.ledgerEntry.groupBy({
            by: ['type'],
            where: {
                userId,
                date: { lt: trendStartDate }
            },
            _sum: { amount: true }
        });
        let currentBalance = Number(beforeStats.find((s) => s.type === 'INCOME')?._sum.amount || 0) -
            Number(beforeStats.find((s) => s.type === 'EXPENSE')?._sum.amount || 0);
        const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
        const keys = Array.from(monthlyTrendsMap.keys());
        keys.forEach(key => {
            const stats = monthlyTrendsMap.get(key);
            const monthEntries = sortedEntries.filter(e => {
                const eKey = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
                return eKey === key;
            });
            monthEntries.forEach(e => {
                const amt = Number(e.amount);
                if (e.type === 'INCOME') {
                    stats.income += amt;
                    currentBalance += amt;
                }
                else {
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
            recentEntries: recentEntries.map((e) => ({
                ...e,
                description: e.description,
                category: e.category ? { ...e.category, name: e.category.name } : null
            })),
            categoryBreakdown,
            monthlyTrends: Array.from(monthlyTrendsMap.values()) // Keep chronological for charts
        };
    }
    async getStats(userId, filters = {}) {
        return this.getDashboardStats(userId, filters);
    }
}
export default new LedgerEntryService();
//# sourceMappingURL=ledger-entry.service.js.map