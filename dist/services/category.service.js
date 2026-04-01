import prisma from '../config/prisma.js';
export class CategoryService {
    async create(userId, name, icon) {
        return await prisma.category.create({
            data: { name, userId, icon },
        });
    }
    async getAll(userId) {
        return await prisma.category.findMany({
            where: { userId },
        });
    }
}
export default new CategoryService();
//# sourceMappingURL=category.service.js.map