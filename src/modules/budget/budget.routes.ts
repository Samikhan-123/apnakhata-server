import { Router } from 'express';
import budgetController from './budget.controller.js';
const router = Router();

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets with progress tracking
 */
router.get('/', budgetController.getBudgets);

/**
 * @route   POST /api/budgets
 * @desc    Create or update a budget limit
 */
router.post('/', budgetController.setBudget);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Remove a budget
 */
router.delete('/:id', budgetController.deleteBudget);

export default router;
