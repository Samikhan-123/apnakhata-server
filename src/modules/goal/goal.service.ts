import { Goal, GoalStatus, LedgerEntryType, Prisma } from "@prisma/client";
import goalRepository from "./goal.repository.js";
import prisma from "../../config/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";

class GoalService {
  async createGoal(userId: string, data: any): Promise<Goal> {
    if (!data.name || !data.targetAmount) {
      throw new AppError("Name and target amount are required", 400);
    }

    return goalRepository.create({
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      color: data.color || "#3b82f6",
      icon: data.icon || "Target",
      savedAmount: 0,
      status: GoalStatus.IN_PROGRESS,
    });
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return goalRepository.findByUserId(userId);
  }

  /**
   * Computes the user's current available balance using a single O(1) groupBy
   * aggregation — no N+1 queries, no sequential fetching.
   * Balance = SUM(INCOME) - SUM(EXPENSE)
   */
  private async getAvailableBalance(userId: string): Promise<number> {
    const grouped = await prisma.ledgerEntry.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    });

    let income = 0;
    let expense = 0;
    for (const row of grouped) {
      if (row.type === LedgerEntryType.INCOME)
        income = Number(row._sum.amount ?? 0);
      else if (row.type === LedgerEntryType.EXPENSE)
        expense = Number(row._sum.amount ?? 0);
    }
    return income - expense;
  }

  async contributeToGoal(
    userId: string,
    goalId: string,
    amount: number,
    description: string
  ): Promise<Goal> {
    if (amount <= 0) {
      throw new AppError("Contribution amount must be greater than 0", 400);
    }

    const goal = await goalRepository.findById(goalId, userId);
    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    if (goal.status === GoalStatus.COMPLETED) {
      throw new AppError("Cannot contribute to a completed goal", 400);
    }

    // ── Balance Guard ────────────────────────────────────────────────────────
    // Fetch the user's real-time available balance with a single O(1) groupBy.
    // This is the authoritative server-side check — frontend validation alone
    // is bypassable and cannot be trusted for financial operations.
    const availableBalance = await this.getAvailableBalance(userId);
    if (amount > availableBalance) {
      throw new AppError(
        `Insufficient balance. Available: ${availableBalance.toFixed(2)}, Required: ${amount.toFixed(2)}`,
        422
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Wrap in a transaction to ensure both ledger entry and goal update succeed atomically
    return prisma.$transaction(async (tx) => {
      // 1. Create LedgerEntry (Expense) — deducts from available balance
      await tx.ledgerEntry.create({
        data: {
          userId,
          amount,
          description: description || `Contribution to ${goal.name}`,
          type: LedgerEntryType.EXPENSE,
          goalId,
          date: new Date(),
        },
      });

      // 2. Increment Goal savedAmount
      const updatedGoal = await tx.goal.update({
        where: { id: goalId, userId },
        data: { savedAmount: { increment: amount } },
      });

      // 3. Auto-complete if target reached
      if (Number(updatedGoal.savedAmount) >= Number(updatedGoal.targetAmount)) {
        return tx.goal.update({
          where: { id: goalId, userId },
          data: { status: GoalStatus.COMPLETED },
        });
      }

      return updatedGoal;
    });
  }

  async withdrawFromGoal(
    userId: string,
    goalId: string,
    amount: number,
    description: string
  ): Promise<Goal> {
    if (amount <= 0) {
      throw new AppError("Withdrawal amount must be greater than 0", 400);
    }

    const goal = await goalRepository.findById(goalId, userId);
    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    if (Number(goal.savedAmount) < amount) {
      throw new AppError("Insufficient funds in goal", 400);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create LedgerEntry (Income) — returns money to available balance
      await tx.ledgerEntry.create({
        data: {
          userId,
          amount,
          description: description || `Withdrawal from ${goal.name}`,
          type: LedgerEntryType.INCOME,
          goalId,
          date: new Date(),
        },
      });

      // 2. Decrement Goal savedAmount and mark IN_PROGRESS
      return tx.goal.update({
        where: { id: goalId, userId },
        data: {
          savedAmount: { decrement: amount },
          status: GoalStatus.IN_PROGRESS,
        },
      });
    });
  }

  async deleteGoal(
    userId: string,
    goalId: string,
    returnFunds: boolean = true
  ): Promise<void> {
    const goal = await goalRepository.findById(goalId, userId);
    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    await prisma.$transaction(async (tx) => {
      // Optionally return saved funds to main balance before deleting
      if (returnFunds && Number(goal.savedAmount) > 0) {
        await tx.ledgerEntry.create({
          data: {
            userId,
            amount: goal.savedAmount,
            description: `Returned funds from deleted goal: ${goal.name}`,
            type: LedgerEntryType.INCOME,
            date: new Date(),
          },
        });
      }

      await tx.goal.delete({ where: { id: goalId, userId } });
    });
  }
}

export default new GoalService();
