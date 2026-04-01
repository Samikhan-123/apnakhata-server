import prisma from '../../config/prisma.js';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation.js';

export class CategoryRepository {
  async findAll(userId: string) {
    return await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async count(userId: string) {
    return await prisma.category.count({
      where: { userId },
    });
  }

  async findById(userId: string, id: string) {
    return await prisma.category.findUnique({
      where: { id, userId },
    });
  }

  async create(userId: string, data: CreateCategoryInput & { isSystem?: boolean }) {
    return await prisma.category.create({
      data: {
        name: data.name.toLowerCase(),
        icon: data.icon,
        isSystem: data.isSystem || false,
        userId,
      },
    });
  }

  async update(userId: string, id: string, data: UpdateCategoryInput) {
    return await prisma.category.update({
      where: { id, userId },
      data,
    });
  }

  async delete(userId: string, id: string) {
    return await prisma.category.delete({
      where: { id, userId },
    });
  }
}

export default new CategoryRepository();
