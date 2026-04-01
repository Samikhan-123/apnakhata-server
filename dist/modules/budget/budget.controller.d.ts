import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
export declare class BudgetController {
    /**
     * List all budgets for current month or specified month
     */
    getBudgets(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create or update a budget
     */
    setBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a budget
     */
    deleteBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: BudgetController;
export default _default;
