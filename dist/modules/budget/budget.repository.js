import prisma from '../../config/prisma.js';
export class BudgetRepository {
    async findAll(userId, month, year) {
        return await prisma.budget.findMany({
            where: { userId, month, year },
            include: {
                category: true,
            },
        });
    }
    async findUnique(userId, categoryId, month, year) {
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
    async upsert(userId, data) {
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
    async delete(userId, id) {
        return await prisma.budget.delete({
            where: { id, userId },
        });
    }
}
export default new BudgetRepository();
//# sourceMappingURL=budget.repository.js.map