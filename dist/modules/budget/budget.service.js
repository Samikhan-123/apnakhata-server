import budgetRepository from './budget.repository.js';
import prisma from '../../config/prisma.js';
export class BudgetService {
    /**
     * Get all budgets for a user in a specific month/year with progress
     */
    async getBudgetsWithProgress(userId, month, year) {
        const budgets = await budgetRepository.findAll(userId, month, year);
        // For each budget, calculate spent amount
        const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
            const spent = await prisma.ledgerEntry.aggregate({
                where: {
                    userId,
                    categoryId: budget.categoryId,
                    type: 'EXPENSE',
                    date: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                },
                _sum: {
                    amount: true,
                },
            });
            const spentAmount = Number(spent._sum.amount || 0);
            const progress = budget.limit.toNumber() > 0
                ? (spentAmount / budget.limit.toNumber()) * 100
                : 0;
            return {
                ...budget,
                spent: spentAmount,
                progress: Math.min(progress, 100),
                isOverBudget: spentAmount > budget.limit.toNumber(),
            };
        }));
        return budgetsWithProgress;
    }
    /**
     * Set or update a budget limit
     */
    async setBudget(userId, data) {
        return await budgetRepository.upsert(userId, data);
    }
    /**
     * Delete a budget
     */
    async deleteBudget(userId, id) {
        return await budgetRepository.delete(userId, id);
    }
}
export default new BudgetService();
//# sourceMappingURL=budget.service.js.map