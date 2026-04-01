import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
export class TransactionService {
    async create(userId, data) {
        return await prisma.$transaction(async (tx) => {
            // 1. Check if account exists and belongs to user
            const account = await tx.account.findUnique({
                where: { id: data.accountId, userId },
            });
            if (!account) {
                throw new AppError('Account not found', 404);
            }
            // 2. Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    amount: data.amount,
                    description: data.description,
                    date: new Date(data.date),
                    type: data.type,
                    userId,
                    accountId: data.accountId,
                    categoryId: data.categoryId,
                    // Tags handled through TransactionTag if we want complex M2M, 
                    // or just simple if we keep it basic for now.
                },
                include: {
                    category: true,
                    account: true,
                }
            });
            // 3. Update Account Balance
            const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    balance: { increment: balanceChange }
                }
            });
            return transaction;
        });
    }
    async getAll(userId, filters) {
        const { categoryId, accountId, startDate, endDate, type } = filters;
        return await prisma.transaction.findMany({
            where: {
                userId,
                ...(categoryId && { categoryId }),
                ...(accountId && { accountId }),
                ...(type && { type }),
                ...(startDate || endDate ? {
                    date: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) }),
                    }
                } : {}),
            },
            include: {
                category: true,
                account: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }
    async delete(userId, id) {
        return await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({
                where: { id, userId }
            });
            if (!transaction) {
                throw new AppError('Transaction not found', 404);
            }
            // Reverse balance change
            const balanceChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
            await tx.account.update({
                where: { id: transaction.accountId },
                data: { balance: { increment: balanceChange } }
            });
            await tx.transaction.delete({ where: { id } });
            return { success: true };
        });
    }
}
export default new TransactionService();
//# sourceMappingURL=transaction.service.js.map