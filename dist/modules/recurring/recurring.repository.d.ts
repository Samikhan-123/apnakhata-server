import { Frequency, LedgerEntryType } from '@prisma/client';
export interface CreateRecurringInput {
    userId: string;
    categoryId?: string;
    amount: number;
    description: string;
    type: LedgerEntryType;
    frequency: Frequency;
    nextExecution: Date;
}
export declare class RecurringRepository {
    create(data: CreateRecurringInput): Promise<{
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
    findAll(userId: string): Promise<({
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
    findDuePatterns(): Promise<{
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
    }[]>;
    update(id: string, data: any, tx?: any): Promise<any>;
    delete(id: string, userId: string): Promise<{
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
}
declare const _default: RecurringRepository;
export default _default;
