import prisma from "../../config/prisma.js";
import {
  CreateLedgerEntryInput,
  LedgerEntryFilters,
} from "./ledger-entry.validation.js";

export class LedgerEntryRepository {
  async create(userId: string, data: CreateLedgerEntryInput, tx?: any) {
    const client = tx || prisma;
    return await client.ledgerEntry.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: new Date(data.date || new Date()),
        type: data.type,
        userId,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string, filters: LedgerEntryFilters) {
    const {
      categoryId,
      startDate,
      endDate,
      type,
      search,
      page = 1,
      limit = 20,
    } = filters;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.ledgerEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { items, total, totalPages, page, limit };
  }

  async findById(id: string, userId: string) {
    return await prisma.ledgerEntry.findUnique({
      where: { id, userId },
      include: {
        category: true,
      },
    });
  }

  async getFinancialSummary(
    userId: string,
    filters: {
      startDate?: string | Date;
      endDate?: string | Date;
      categoryId?: string;
      search?: string;
    } = {},
  ) {
    const { startDate, endDate, categoryId, search } = filters;

    // Common date and search filters
    const commonFilter = {
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
      ...(search && {
        description: { contains: search, mode: "insensitive" as const },
      }),
    };

    // Single optimized query to get both income and expense
    const stats = await prisma.ledgerEntry.groupBy({
      by: ["type"],
      where: {
        userId,
        ...(categoryId && { categoryId }),
        ...commonFilter,
      },
      _sum: { amount: true },
    });

    const income = Number(
      stats.find((s: any) => s.type === "INCOME")?._sum.amount || 0,
    );
    const expense = Number(
      stats.find((s: any) => s.type === "EXPENSE")?._sum.amount || 0,
    );

    return {
      totalIncome: income,
      totalExpense: expense,
      remainingBalance: income - expense,
    };
  }

  async delete(id: string, userId: string, tx?: any) {
    const client = tx || prisma;
    return await client.ledgerEntry.delete({
      where: { id, userId },
    });
  }
}

export default new LedgerEntryRepository();
