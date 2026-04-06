import budgetService from './budget.service.js';
import { createBudgetSchema } from './budget.validation.js';
export class BudgetController {
    /**
     * List all budgets for current month or specified month
     */
    async getBudgets(req, res, next) {
        try {
            const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
            const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
            const budgets = await budgetService.getBudgetsWithProgress(req.user.id, month, year);
            res.status(200).json({
                success: true,
                data: budgets,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create or update a budget
     */
    async setBudget(req, res, next) {
        try {
            const validatedData = createBudgetSchema.parse(req.body);
            const budget = await budgetService.setBudget(req.user.id, validatedData);
            // response
            res.status(200).json({
                success: true,
                message: 'Budget updated successfully',
                data: budget,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a budget
     */
    async deleteBudget(req, res, next) {
        try {
            const id = req.params.id;
            await budgetService.deleteBudget(req.user.id, id);
            res.status(200).json({
                success: true,
                message: 'Budget removed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new BudgetController();
//# sourceMappingURL=budget.controller.js.map