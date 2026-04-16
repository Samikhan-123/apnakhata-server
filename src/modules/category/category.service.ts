import categoryRepository from './category.repository.js';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class CategoryService {
  /**
   * List all categories for a user
   */
  async getAll(userId: string) {
    return await categoryRepository.findAll(userId);
  }

  /**
   * Get a single category
   */
  async getById(userId: string, id: string) {
    const category = await categoryRepository.findById(userId, id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

   /**
   * Create a new category
   */
  async create(userId: string, data: CreateCategoryInput) {
    const count = await categoryRepository.count(userId);
    if (count >= 20) {
      throw new AppError('Category limit reached. Max 20 categories allowed.', 400);
    }
    return await categoryRepository.create(userId, {
      ...data,
      name: data.name.toLowerCase()
    });
  }

  /**
   * Update a category
   */
  async update(userId: string, id: string, data: UpdateCategoryInput) {
    const category = await categoryRepository.findById(userId, id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    if (category.isSystem) {
      throw new AppError('System categories are permanent and cannot be modified.', 400);
    }
    return await categoryRepository.update(userId, id, {
      ...data,
      name: data.name?.toLowerCase()
    });
  }

  async delete(userId: string, id: string) {
    throw new AppError('Financial governance policy: Categories are permanent classifiers and cannot be deleted.', 400);
  }
}

export default new CategoryService();
