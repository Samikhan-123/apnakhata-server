import prisma from '../../config/prisma.js';
import { CreateBudgetInput, UpdateBudgetInput } from './budget.validation.js';

export class BudgetRepository {
  async findAll(userId: string, month: number, year: number) {
    return await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: true,
      },
    });
  }

  async findUnique(userId: string, categoryId: string, month: number, year: number) {
    return await prisma.budget.findUnique({
      where: {
        categoryId_month_year_userId: {
          userId,
          categoryId,
          month,
          year,
        },
      },
    });
  }

  async upsert(userId: string, data: CreateBudgetInput) {
    return await prisma.budget.upsert({
      where: {
        categoryId_month_year_userId: {
          userId,
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        },
      },
      update: {
        limit: data.limit,
      },
      create: {
        ...data,
        userId,
      },
    });
  }

  async delete(userId: string, id: string) {
    return await prisma.budget.delete({
      where: { id, userId },
    });
  }
}

export default new BudgetRepository();
