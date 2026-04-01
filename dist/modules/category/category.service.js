import categoryRepository from './category.repository.js';
import { AppError } from '../../middlewares/error.middleware.js';
export class CategoryService {
    /**
     * List all categories for a user
     */
    async getAll(userId) {
        const categories = await categoryRepository.findAll(userId);
        // Lazy seeding: If user has no categories, create default ones
        if (categories.length === 0) {
            const defaults = [
                { name: 'food', icon: 'Utensils', isSystem: true },
                { name: 'transport', icon: 'Car', isSystem: true },
                { name: 'utilities', icon: 'Zap', isSystem: true },
                { name: 'entertainment', icon: 'Film', isSystem: true },
                { name: 'health', icon: 'HeartPulse', isSystem: true }
            ];
            await Promise.all(defaults.map(d => categoryRepository.create(userId, d)));
            return await categoryRepository.findAll(userId);
        }
        return categories;
    }
    /**
     * Get a single category
     */
    async getById(userId, id) {
        const category = await categoryRepository.findById(userId, id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }
    /**
    * Create a new category
    */
    async create(userId, data) {
        const count = await categoryRepository.count(userId);
        if (count >= 20) {
            throw new AppError('Category limit reached. Max 20 categories allowed.', 400);
        }
        return await categoryRepository.create(userId, data);
    }
    /**
     * Update a category
     */
    async update(userId, id, data) {
        const category = await categoryRepository.findById(userId, id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        if (category.isSystem) {
            throw new AppError('System categories are permanent and cannot be modified.', 400);
        }
        return await categoryRepository.update(userId, id, data);
    }
    async delete(userId, id) {
        throw new AppError('Financial governance policy: Categories are permanent classifiers and cannot be deleted.', 400);
    }
}
export default new CategoryService();
//# sourceMappingURL=category.service.js.map