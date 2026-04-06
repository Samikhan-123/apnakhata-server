import prisma from '../../config/prisma.js';
export class RecurringRepository {
    async create(data) {
        return await prisma.recurringEntry.create({
            data: {
                ...data,
                description: data.description.toLowerCase(),
                amount: data.amount,
            }
        });
    }
    async findAll(userId) {
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
    async update(id, data, tx) {
        const client = tx || prisma;
        return await client.recurringEntry.update({
            where: { id },
            data: {
                ...data,
                ...(data.description && { description: data.description.toLowerCase() })
            }
        });
    }
    async delete(id, userId) {
        return await prisma.recurringEntry.delete({
            where: { id, userId }
        });
    }
    async findById(id) {
        return await prisma.recurringEntry.findUnique({
            where: { id },
            include: { category: true }
        });
    }
}
export default new RecurringRepository();
//# sourceMappingURL=recurring.repository.js.map