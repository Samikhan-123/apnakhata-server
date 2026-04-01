import { Frequency } from '@prisma/client';
export declare class RecurringService {
    createEntry(userId: string, data: any): Promise<{
        type: import("@prisma/client").$Enums.LedgerEntryType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string;
        categoryId: string | null;
        frequency: import("@prisma/client").$Enums.Frequency;
        nextExecution: Date;
        lastExecution: Date | null;
        isActive: boolean;
        hits: number;
        lastStatus: string | null;
        lastStatusDate: Date | null;
    }>;
    calculateNextExecution(currentDate: Date, frequency: Frequency): Date;
    processDueEntries(): Promise<({
        id: string;
        success: boolean;
        error?: undefined;
    } | {
        id: string;
        success: boolean;
        error: unknown;
    })[]>;
    getUserEntries(userId: string): Promise<({
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
        categoryId: string | null;
        frequency: import("@prisma/client").$Enums.Frequency;
        nextExecution: Date;
        lastExecution: Date | null;
        isActive: boolean;
        hits: number;
        lastStatus: string | null;
        lastStatusDate: Date | null;
    })[]>;
    deleteEntry(id: string, userId: string): Promise<{
        type: import("@prisma/client").$Enums.LedgerEntryType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        description: string;
        categoryId: string | null;
        frequency: import("@prisma/client").$Enums.Frequency;
        nextExecution: Date;
        lastExecution: Date | null;
        isActive: boolean;
        hits: number;
        lastStatus: string | null;
        lastStatusDate: Date | null;
    }>;
    findById(id: string): Promise<({
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
        categoryId: string | null;
        frequency: import("@prisma/client").$Enums.Frequency;
        nextExecution: Date;
        lastExecution: Date | null;
        isActive: boolean;
        hits: number;
        lastStatus: string | null;
        lastStatusDate: Date | null;
    }) | null>;
    /**
     * Manually trigger all due patterns for a user
     */
    triggerUserSync(userId: string): Promise<{
        message: string;
        count: number;
        successCount: number;
        skippedCount: number;
        results: ({
            id: string;
            success: boolean;
            reason?: undefined;
        } | {
            id: string;
            success: boolean;
            reason: any;
        })[];
    }>;
    private processSingleEntry;
}
declare const _default: RecurringService;
export default _default;
