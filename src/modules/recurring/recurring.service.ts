import { Frequency } from "@prisma/client";
import recurringRepository from "./recurring.repository.js";
import ledgerEntryRepository from "../ledger-entry/ledger-entry.repository.js";
import prisma from "../../config/prisma.js";

export class RecurringService {
  async createEntry(userId: string, data: any) {
    // If user provided a date, use it. If not, default to NOW.
    const baseDate = data.nextExecution
      ? new Date(data.nextExecution)
      : new Date();

    const nextExecution = new Date(baseDate);
    nextExecution.setUTCHours(0, 0, 0, 0);

    return await recurringRepository.create({
      ...data,
      description: data.description.toLowerCase(),
      userId,
      nextExecution,
    });
  }

  calculateNextExecution(currentDate: Date, frequency: Frequency): Date {
    const next = new Date(currentDate);

    // Normalize to 00:00 UTC to ensure reliability in the next day's cron cycle
    if (frequency !== "TEN_SECONDS") {
      next.setUTCHours(0, 0, 0, 0);
    }

    switch (frequency) {
      case "TEN_SECONDS":
        next.setSeconds(next.getSeconds() + 10);
        break;
      case "DAILY":
        next.setDate(next.getDate() + 1);
        break;
      case "WEEKLY":
        next.setDate(next.getDate() + 7);
        break;
      case "MONTHLY":
        next.setMonth(next.getMonth() + 1);
        break;
      case "YEARLY":
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }

  async processDueEntries() {
    const dueEntries = await recurringRepository.findDuePatterns();
    const results = [];

    for (const entry of dueEntries) {
      try {
        await prisma.$transaction(async (tx: any) => {
          // 0. Income First Rule for Recurring Expenses
          if (entry.type === "EXPENSE") {
            const summary = await ledgerEntryRepository.getFinancialSummary(
              entry.userId,
            );
            if (
              summary.totalIncome <= 0 ||
              summary.remainingBalance < Number(entry.amount)
            ) {
              await recurringRepository.update(entry.id, {
                lastStatus: "INSUFFICIENT_BALANCE",
                lastStatusDate: new Date(),
              });
              return; // Skip this entry in this run
            }
          }

          // 1. Create Ledger Entry
          await ledgerEntryRepository.create(
            entry.userId,
            {
              amount: Number(entry.amount),
              description: `[auto-completed] ${entry.description}`,
              type: entry.type,
              categoryId: entry.categoryId || undefined,
              date: new Date().toISOString(),
            },
            tx,
          );

          // 2. Update Entry nextExecution and increment hits
          const nextExecution = this.calculateNextExecution(
            entry.nextExecution,
            entry.frequency,
          );
          await recurringRepository.update(
            entry.id,
            {
              nextExecution,
              lastExecution: new Date(),
              hits: { increment: 1 },
              lastStatus: "SUCCESS",
              lastStatusDate: new Date(),
            },
            tx,
          );
        });

        results.push({ id: entry.id, success: true });
      } catch (error) {
        results.push({ id: entry.id, success: false, error });
      }
    }

    return results;
  }

  async getUserEntries(userId: string) {
    return await recurringRepository.findAll(userId);
  }

  async deleteEntry(id: string, userId: string) {
    return await recurringRepository.delete(id, userId);
  }

  async findById(id: string) {
    return await recurringRepository.findById(id);
  }

  /**
   * Manually trigger all due patterns for a user
   */
  async triggerUserSync(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastSyncAt: true },
    });

    const now = new Date();

    // 1. Throttling: Only sync once every 6 hours to protect performance
    if (user?.lastSyncAt) {
      const lastSync = new Date(user.lastSyncAt);
      const hoursSinceLastSync =
        (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync < 6) {
        return {
          message: "Sync throttled. System is already up-to-date.",
          skipped: true,
        };
      }
    }

    const allEntries = await recurringRepository.findAll(userId);

    // Force sync only if the task is actually due (nextExecution <= now)
    const userDueEntries = allEntries.filter(
      (e) =>
        e.userId === userId &&
        new Date(e.nextExecution).getTime() <= now.getTime(),
    );

    const results = [];
    let skippedCount = 0;

    for (const entry of userDueEntries) {
      try {
        await this.processSingleEntry(entry);
        results.push({ id: entry.id, success: true });
      } catch (error: any) {
        if (error.message === "Insufficient balance") {
          skippedCount++;
        }
        results.push({
          id: entry.id,
          success: false,
          reason: error.message || "Unknown error",
        });
      }
    }

    const finalSuccessCount = results.filter((r) => r.success).length;
    let message = `Successfully synced ${finalSuccessCount} tasks.`;

    if (skippedCount > 0) {
      message += ` (${skippedCount} skipped due to balance)`;
    } else if (results.length > 0 && finalSuccessCount === 0) {
      const firstFailure = results.find((r) => !r.success);
      if (firstFailure) {
        message += ` (Reason: ${firstFailure.reason})`;
      }
    }

    // 2. Update lastSyncAt for the user
    await prisma.user.update({
      where: { id: userId },
      data: { lastSyncAt: now },
    });

    return {
      message,
      count: results.length,
      successCount: finalSuccessCount,
      skippedCount,
      results,
    };
  }

  private async processSingleEntry(entry: any) {
    return await prisma.$transaction(async (tx: any) => {
      // Income First Rule
      if (entry.type === "EXPENSE") {
        const summary = await ledgerEntryRepository.getFinancialSummary(
          entry.userId,
        );
        if (
          summary.totalIncome <= 0 ||
          summary.remainingBalance < Number(entry.amount)
        ) {
          await recurringRepository.update(entry.id, {
            lastStatus: "INSUFFICIENT_BALANCE",
            lastStatusDate: new Date(),
          });
          throw new Error("Insufficient balance");
        }
      }

      await ledgerEntryRepository.create(
        entry.userId,
        {
          amount: Number(entry.amount),
          description: `[auto-completed] ${entry.description}`,
          type: entry.type,
          categoryId: entry.categoryId || undefined,
          date: new Date().toISOString(),
        },
        tx,
      );

      const nextExecution = this.calculateNextExecution(
        entry.nextExecution,
        entry.frequency,
      );
      await recurringRepository.update(
        entry.id,
        {
          nextExecution,
          lastExecution: new Date(),
          hits: { increment: 1 },
          lastStatus: "SUCCESS",
          lastStatusDate: new Date(),
        },
        tx,
      );
    });
  }
}

export default new RecurringService();
