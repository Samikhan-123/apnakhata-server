import prisma from '../config/prisma.js';
export class AccountService {
    async create(userId, name, type, balance = 0) {
        return await prisma.account.create({
            data: { name, type, balance, userId },
        });
    }
    async getAll(userId) {
        return await prisma.account.findMany({
            where: { userId },
        });
    }
}
export default new AccountService();
//# sourceMappingURL=account.service.js.map