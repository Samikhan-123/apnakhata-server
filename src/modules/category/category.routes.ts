import { Router } from 'express';
import categoryController from './category.controller.js';
const router = Router();

/**
 * @route   GET /api/categories
 * @desc    List all categories
 */
router.get('/', categoryController.getAll);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 */
router.post('/', categoryController.create);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Update a category
 */
router.patch('/:id', categoryController.update);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 */
router.delete('/:id', categoryController.delete);

export default router;
