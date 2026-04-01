import { CreateLedgerEntryInput, LedgerEntryFilters } from './ledger-entry.validation.js';
export declare class LedgerEntryRepository {
    create(userId: string, data: CreateLedgerEntryInput, tx?: any): Promise<any>;
    findAll(userId: string, filters: LedgerEntryFilters): Promise<{
        items: ({
            category: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                icon: string | null;
                userId: string;
                isSystem: boolean;
            } | null;
        } & {
            type: import("@prisma/client").$Enums.LedgerEntryType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            description: string;
            date: Date;
            categoryId: string | null;
            receiptUrl: string | null;
            receiptPublicId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string, userId: string): Promise<({
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
            userId: string;
            isSystem: boolean;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.LedgerEntryType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string;
        date: Date;
        categoryId: string | null;
        receiptUrl: string | null;
        receiptPublicId: string | null;
    }) | null>;
    getFinancialSummary(userId: string, filters?: {
        startDate?: string | Date;
        endDate?: string | Date;
        categoryId?: string;
        search?: string;
    }): Promise<{
        totalIncome: number;
        totalExpense: number;
        remainingBalance: number;
    }>;
    delete(id: string, userId: string, tx?: any): Promise<any>;
}
declare const _default: LedgerEntryRepository;
export default _default;
