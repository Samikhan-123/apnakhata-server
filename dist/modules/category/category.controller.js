import categoryService from './category.service.js';
import { createCategorySchema, updateCategorySchema } from './category.validation.js';
export class CategoryController {
    /**
     * List all categories for current user
     */
    async getAll(req, res, next) {
        try {
            const categories = await categoryService.getAll(req.user.id);
            res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create a new category
     */
    async create(req, res, next) {
        try {
            const validatedData = createCategorySchema.parse(req.body);
            const category = await categoryService.create(req.user.id, validatedData);
            res.status(201).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update a category
     */
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const validatedData = updateCategorySchema.parse(req.body);
            const category = await categoryService.update(req.user.id, id, validatedData);
            res.status(200).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a category
     */
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            await categoryService.delete(req.user.id, id);
            res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new CategoryController();
//# sourceMappingURL=category.controller.js.map