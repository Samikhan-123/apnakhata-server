import prisma from '../../config/prisma.js';
// class for category repository
export class CategoryRepository {
    // find all categories
    async findAll(userId) {
        return await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
    }
    // count categories
    async count(userId) {
        return await prisma.category.count({
            where: { userId },
        });
    }
    // find category by id
    async findById(userId, id) {
        return await prisma.category.findUnique({
            where: { id, userId },
        });
    }
    // create category
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
    // update category
    async update(userId, id, data) {
        return await prisma.category.update({
            where: { id, userId },
            data,
        });
    }
    // delete category
    async delete(userId, id) {
        return await prisma.category.delete({
            where: { id, userId },
        });
    }
}
export default new CategoryRepository();
//# sourceMappingURL=category.repository.js.map