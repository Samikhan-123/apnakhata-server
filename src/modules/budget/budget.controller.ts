import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import budgetService from './budget.service.js';
import { createBudgetSchema } from './budget.validation.js';

export class BudgetController {
  /**
   * List all budgets for current month or specified month
   */
  async getBudgets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

      const budgets = await budgetService.getBudgetsWithProgress(req.user.id, month, year);
      
      res.status(200).json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update a budget
   */
  async setBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createBudgetSchema.parse(req.body);
      const budget = await budgetService.setBudget(req.user.id, validatedData);
      
      // response
      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a budget
   */
  async deleteBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await budgetService.deleteBudget(req.user.id, id);
      
      res.status(200).json({
        success: true,
        message: 'Budget removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetController();
