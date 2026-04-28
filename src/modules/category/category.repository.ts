import prisma from "../../config/prisma.js";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation.js";

// class for category repository
export class CategoryRepository {
  // find all categories
  async findAll(userId: string) {
    return await prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { name: "asc" },
    });
  }

  // count categories
  async count(userId: string) {
    return await prisma.category.count({
      where: { userId },
    });
  }

  // find category by id
  async findById(userId: string, id: string) {
    return await prisma.category.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { userId: null }, // Allow access to global categories
        ],
      },
    });
  }

  // create category
  async create(
    userId: string,
    data: CreateCategoryInput & { isSystem?: boolean },
  ) {
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
  async update(userId: string, id: string, data: UpdateCategoryInput) {
    return await prisma.category.update({
      where: { id, userId },
      data,
    });
  }

  // delete category
  async delete(userId: string, id: string) {
    return await prisma.category.delete({
      where: { id, userId },
    });
  }
}

export default new CategoryRepository();
