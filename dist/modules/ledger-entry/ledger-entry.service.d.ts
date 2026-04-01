import { CreateLedgerEntryInput, UpdateLedgerEntryInput, LedgerEntryFilters } from './ledger-entry.validation.js';
export declare class LedgerEntryService {
    /**
     * Create a new ledger entry
     */
    create(userId: string, data: CreateLedgerEntryInput): Promise<any>;
    /**
     * List all ledger entries for a user with filters
     */
    getAll(userId: string, filters: LedgerEntryFilters): Promise<{
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
    /**
     * Get a single ledger entry by ID
     */
    getById(userId: string, id: string): Promise<{
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
    }>;
    /**
     * Delete a ledger entry
     */
    delete(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    /**
     * Update a ledger entry
     */
    update(userId: string, id: string, data: UpdateLedgerEntryInput): Promise<{
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
    }>;
    /**
     * Financial Summary (Filtered or All-time)
     */
    getOverview(userId: string, filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        totalIncome: number;
        totalExpense: number;
        remainingBalance: number;
    }>;
    getDashboardStats(userId: string, filters?: any): Promise<{
        overview: {
            balance: number;
            totalIncome: number;
            totalExpense: number;
            remainingBalance: number;
        };
        recentEntries: any[];
        categoryBreakdown: {
            name: string;
            value: number;
        }[];
        monthlyTrends: any[];
    }>;
    getStats(userId: string, filters?: any): Promise<{
        overview: {
            balance: number;
            totalIncome: number;
            totalExpense: number;
            remainingBalance: number;
        };
        recentEntries: any[];
        categoryBreakdown: {
            name: string;
            value: number;
        }[];
        monthlyTrends: any[];
    }>;
}
declare const _default: LedgerEntryService;
export default _default;
