import budgetRepository from './budget.repository.js';
import prisma from '../../config/prisma.js';
import { CreateBudgetInput, UpdateBudgetInput } from './budget.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class BudgetService {
  /**
   * Get all budgets for a user in a specific month/year with progress
   */
  async getBudgetsWithProgress(userId: string, month: number, year: number) {
    const budgets = await budgetRepository.findAll(userId, month, year);
    
    // For each budget, calculate spent amount
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget: any) => {
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
      })
    );

    return budgetsWithProgress;
  }

  /**
   * Set or update a budget limit
   */
  async setBudget(userId: string, data: CreateBudgetInput) {
    return await budgetRepository.upsert(userId, data);
  }

  /**
   * Delete a budget
   */
  async deleteBudget(userId: string, id: string) {
    return await budgetRepository.delete(userId, id);
  }
}

export default new BudgetService();
