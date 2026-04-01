import { CreateBudgetInput } from './budget.validation.js';
export declare class BudgetService {
    /**
     * Get all budgets for a user in a specific month/year with progress
     */
    getBudgetsWithProgress(userId: string, month: number, year: number): Promise<any[]>;
    /**
     * Set or update a budget limit
     */
    setBudget(userId: string, data: CreateBudgetInput): Promise<{
        id: string;
        year: number;
        userId: string;
        limit: import("@prisma/client-runtime-utils").Decimal;
        categoryId: string;
        month: number;
    }>;
    /**
     * Delete a budget
     */
    deleteBudget(userId: string, id: string): Promise<{
        id: string;
        year: number;
        userId: string;
        limit: import("@prisma/client-runtime-utils").Decimal;
        categoryId: string;
        month: number;
    }>;
}
declare const _default: BudgetService;
export default _default;
