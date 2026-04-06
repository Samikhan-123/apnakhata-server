import { PrismaClient, Frequency, LedgerEntryType } from '@prisma/client';
import prisma from '../../config/prisma.js';

export interface CreateRecurringInput {
  userId: string;
  categoryId?: string;
  amount: number;
  description: string;
  type: LedgerEntryType;
  frequency: Frequency;
  nextExecution: Date;
}

export class RecurringRepository {
  async create(data: CreateRecurringInput) {
    return await prisma.recurringEntry.create({
      data: {
        ...data,
        description: data.description.toLowerCase(),
        amount: data.amount,
      }
    });
  }

  async findAll(userId: string) {
    return await prisma.recurringEntry.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findDuePatterns() {
    return await prisma.recurringEntry.findMany({
      where: {
        isActive: true,
        nextExecution: {
          lte: new Date()
        }
      }
    });
  }

  async update(id: string, data: any, tx?: any) {
    const client = tx || prisma;
    return await client.recurringEntry.update({
      where: { id },
      data: {
        ...data,
        ...(data.description && { description: data.description.toLowerCase() })
      }
    });
  }

  async delete(id: string, userId: string) {
    return await prisma.recurringEntry.delete({
      where: { id, userId }
    });
  }

  async findById(id: string) {
    return await prisma.recurringEntry.findUnique({
      where: { id },
      include: { category: true }
    });
  }
}

export default new RecurringRepository();
