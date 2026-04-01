import prisma from '../../config/prisma.js';
export class CategoryRepository {
    async findAll(userId) {
        return await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
    }
    async count(userId) {
        return await prisma.category.count({
            where: { userId },
        });
    }
    async findById(userId, id) {
        return await prisma.category.findUnique({
            where: { id, userId },
        });
    }
    async create(userId, data) {
        return await prisma.category.create({
            data: {
                name: data.name.toLowerCase(),
                icon: data.icon,
                isSystem: data.isSystem || false,
                userId,
            },
        });
    }
    async update(userId, id, data) {
        return await prisma.category.update({
            where: { id, userId },
            data,
        });
    }
    async delete(userId, id) {
        return await prisma.category.delete({
            where: { id, userId },
        });
    }
}
export default new CategoryRepository();
//# sourceMappingURL=category.repository.js.map