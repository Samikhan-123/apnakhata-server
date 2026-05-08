import budgetRepository from "./budget.repository.js";
import prisma from "../../config/prisma.js";
import { CreateBudgetInput, UpdateBudgetInput } from "./budget.validation.js";
import { AppError } from "../../middlewares/error.middleware.js";

export class BudgetService {
  /**
   * Get all budgets for a user in a specific month/year with progress
   */
  async getBudgetsWithProgress(userId: string, month: number, year: number) {
    const budgets = await budgetRepository.findAll(userId, month, year);

    if (!budgets.length) return [];

    const categoryIds = budgets.map((b: any) => b.categoryId);

    // Fetch all relevant expenses in a single query (O(1) database queries instead of O(N))
    const expenses = await prisma.ledgerEntry.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        categoryId: { in: categoryIds },
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const expenseMap = new Map();
    expenses.forEach((e) => {
      expenseMap.set(e.categoryId, Number(e._sum.amount || 0));
    });

    return budgets.map((budget: any) => {
      const spentAmount = expenseMap.get(budget.categoryId) || 0;
      const progress =
        budget.limit.toNumber() > 0
          ? (spentAmount / budget.limit.toNumber()) * 100
          : 0;

      return {
        ...budget,
        spent: spentAmount,
        progress: Math.min(progress, 100),
        isOverBudget: spentAmount > budget.limit.toNumber(),
      };
    });
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
