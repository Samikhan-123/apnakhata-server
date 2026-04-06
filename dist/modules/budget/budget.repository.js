import prisma from '../../config/prisma.js';
// class for budget repository
export class BudgetRepository {
    async findAll(userId, month, year) {
        return await prisma.budget.findMany({
            where: { userId, month, year },
            include: {
                category: true,
            },
        });
    }
    // find unique budget
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
    // upsert budget
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
    // delete budget
    async delete(userId, id) {
        return await prisma.budget.delete({
            where: { id, userId },
        });
    }
}
export default new BudgetRepository();
//# sourceMappingURL=budget.repository.js.map