import prisma from '../../config/prisma.js';
export class LedgerEntryRepository {
    async create(userId, data, tx) {
        const client = tx || prisma;
        return await client.ledgerEntry.create({
            data: {
                amount: data.amount,
                description: data.description.toLowerCase(),
                date: new Date(data.date || new Date()),
                type: data.type,
                userId,
                categoryId: data.categoryId,
            },
            include: {
                category: true,
            }
        });
    }
    async findAll(userId, filters) {
        const { categoryId, startDate, endDate, type, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            userId,
            ...(categoryId && { categoryId }),
            ...(type && { type }),
            ...(search && {
                OR: [
                    { description: { contains: search, mode: 'insensitive' } },
                ]
            }),
            ...(startDate || endDate ? {
                date: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
                }
            } : {}),
        };
        const [items, total] = await Promise.all([
            prisma.ledgerEntry.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.ledgerEntry.count({ where })
        ]);
        return { items, total, page, limit };
    }
    async findById(id, userId) {
        return await prisma.ledgerEntry.findUnique({
            where: { id, userId },
            include: {
                category: true,
            }
        });
    }
    async getFinancialSummary(userId, filters = {}) {
        const { startDate, endDate, categoryId, search } = filters;
        // Common date and search filters
        const commonFilter = {
            ...(startDate || endDate ? {
                date: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
                }
            } : {}),
            ...(search && {
                description: { contains: search, mode: 'insensitive' }
            })
        };
        const [incomeStats, expenseStats] = await Promise.all([
            // Income should NOT be filtered by category (as income usually has no category)
            prisma.ledgerEntry.groupBy({
                by: ['type'],
                where: {
                    userId,
                    type: 'INCOME',
                    ...commonFilter
                },
                _sum: { amount: true }
            }),
            // Expense should be filtered by category if specified
            prisma.ledgerEntry.groupBy({
                by: ['type'],
                where: {
                    userId,
                    type: 'EXPENSE',
                    ...(categoryId && { categoryId }),
                    ...commonFilter
                },
                _sum: { amount: true }
            })
        ]);
        const income = Number(incomeStats.find((s) => s.type === 'INCOME')?._sum.amount || 0);
        const expense = Number(expenseStats.find((s) => s.type === 'EXPENSE')?._sum.amount || 0);
        return {
            totalIncome: income,
            totalExpense: expense,
            remainingBalance: income - expense
        };
    }
    async delete(id, userId, tx) {
        const client = tx || prisma;
        return await client.ledgerEntry.delete({
            where: { id, userId }
        });
    }
}
export default new LedgerEntryRepository();
//# sourceMappingURL=ledger-entry.repository.js.map