import { CreateBudgetInput } from './budget.validation.js';
export declare class BudgetRepository {
    findAll(userId: string, month: number, year: number): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
            userId: string;
            isSystem: boolean;
        };
    } & {
        id: string;
        year: number;
        userId: string;
        limit: import("@prisma/client-runtime-utils").Decimal;
        categoryId: string;
        month: number;
    })[]>;
    findUnique(userId: string, categoryId: string, month: number, year: number): Promise<{
        id: string;
        year: number;
        userId: string;
        limit: import("@prisma/client-runtime-utils").Decimal;
        categoryId: string;
        month: number;
    } | null>;
    upsert(userId: string, data: CreateBudgetInput): Promise<{
        id: string;
        year: number;
        userId: string;
        limit: import("@prisma/client-runtime-utils").Decimal;
        categoryId: string;
        month: number;
    }>;
    delete(userId: string, id: string): Promise<{
        id: string;
        year: number;
        userId: string;
        limit: import("@prisma/client-runtime-utils").Decimal;
        categoryId: string;
        month: number;
    }>;
}
declare const _default: BudgetRepository;
export default _default;
