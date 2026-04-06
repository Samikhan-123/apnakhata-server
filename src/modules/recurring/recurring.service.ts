import { Frequency } from '@prisma/client';
import recurringRepository from './recurring.repository.js';
import ledgerEntryRepository from '../ledger-entry/ledger-entry.repository.js';
import prisma from '../../config/prisma.js';

export class RecurringService {
  async createEntry(userId: string, data: any) {
    const nextExecution = data.nextExecution ? new Date(data.nextExecution) : this.calculateNextExecution(new Date(), data.frequency);
    return await recurringRepository.create({
      ...data,
      description: data.description.toLowerCase(),
      userId,
      nextExecution,
    });
  }

  calculateNextExecution(currentDate: Date, frequency: Frequency): Date {
    const next = new Date(currentDate);

    // Normalize to 12 PM Noon for non-test frequencies to align with Cron job
    if (frequency !== 'TEN_SECONDS') {
      next.setHours(12, 0, 0, 0);
    }

    switch (frequency) {
      case 'TEN_SECONDS':
        next.setSeconds(next.getSeconds() + 10);
        break;
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'YEARLY':
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
          if (entry.type === 'EXPENSE') {
            const summary = await ledgerEntryRepository.getFinancialSummary(entry.userId);
            if (summary.totalIncome <= 0 || summary.remainingBalance < Number(entry.amount)) {
              await recurringRepository.update(entry.id, {
                lastStatus: 'INSUFFICIENT_BALANCE',
                lastStatusDate: new Date()
              });
              return; // Skip this entry in this run
            }
          }

          // 1. Create Ledger Entry
          await ledgerEntryRepository.create(entry.userId, {
            amount: Number(entry.amount),
            description: `[auto-completed] ${entry.description}`,
            type: entry.type,
            categoryId: entry.categoryId || undefined,
            date: new Date().toISOString(),
          }, tx);

          // 2. Update Entry nextExecution and increment hits
          const nextExecution = this.calculateNextExecution(entry.nextExecution, entry.frequency);
          await recurringRepository.update(entry.id, {
            nextExecution,
            lastExecution: new Date(),
            hits: { increment: 1 },
            lastStatus: 'SUCCESS',
            lastStatusDate: new Date()
          }, tx);
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
    const allEntries = await recurringRepository.findAll(userId);
    const now = new Date();
    
    // Force sync works if:
    // 1. It's actually due (nextExecution <= now)
    // 2. OR it's a NEW task (hits === 0) - allows immediate first execution
    const userDueEntries = allEntries.filter(e => e.userId === userId && (
      e.nextExecution <= now || (e.hits === 0)
    ));
    
    const results = [];
    let skippedCount = 0;

    for (const entry of userDueEntries) {
      try {
        await this.processSingleEntry(entry);
        results.push({ id: entry.id, success: true });
      } catch (error: any) {
        if (error.message === 'Insufficient balance') {
          skippedCount++;
        }
        results.push({ id: entry.id, success: false, reason: error.message || 'Unknown error' });
      }
    }

    const finalSuccessCount = results.filter(r => r.success).length;
    let message = `Successfully synced ${finalSuccessCount} tasks.`;
    
    if (skippedCount > 0) {
      message += ` (${skippedCount} skipped due to balance)`;
    } else if (results.length > 0 && finalSuccessCount === 0) {
      const firstFailure = results.find(r => !r.success);
      if (firstFailure) {
        message += ` (Reason: ${firstFailure.reason})`;
      }
    }

    return { message, count: results.length, successCount: finalSuccessCount, skippedCount, results };
  }

  private async processSingleEntry(entry: any) {
    return await prisma.$transaction(async (tx: any) => {
      // Income First Rule
      if (entry.type === 'EXPENSE') {
        const summary = await ledgerEntryRepository.getFinancialSummary(entry.userId);
        if (summary.totalIncome <= 0 || summary.remainingBalance < Number(entry.amount)) {
           await recurringRepository.update(entry.id, {
             lastStatus: 'INSUFFICIENT_BALANCE',
             lastStatusDate: new Date()
           });
           throw new Error('Insufficient balance');
        }
      }

      await ledgerEntryRepository.create(entry.userId, {
        amount: Number(entry.amount),
        description: `[auto-completed] ${entry.description}`,
        type: entry.type,
        categoryId: entry.categoryId || undefined,
        date: new Date().toISOString(),
      }, tx);

      const nextExecution = this.calculateNextExecution(entry.nextExecution, entry.frequency);
      await recurringRepository.update(entry.id, {
        nextExecution,
        lastExecution: new Date(),
        hits: { increment: 1 },
        lastStatus: 'SUCCESS',
        lastStatusDate: new Date()
      }, tx);
    });
  }
}

export default new RecurringService();
