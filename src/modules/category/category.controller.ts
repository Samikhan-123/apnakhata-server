import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import categoryService from './category.service.js';
import { createCategorySchema, updateCategorySchema } from './category.validation.js';

export class CategoryController {
  /**
   * List all categories for current user
   */
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll(req.user.id);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new category
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await categoryService.create(req.user.id, validatedData);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a category
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await categoryService.update(req.user.id, id, validatedData);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a category
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await categoryService.delete(req.user.id, id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
