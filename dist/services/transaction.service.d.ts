import { CreateTransactionInput } from '../schemas/transaction.schema.js';
import { Prisma } from '@prisma/client';
export declare class TransactionService {
    create(userId: string, data: CreateTransactionInput): Promise<{
        account: {
            userId: string;
            type: import("@prisma/client").$Enums.AccountType;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            balance: Prisma.Decimal;
        };
        category: {
            userId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        } | null;
    } & {
        userId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        description: string;
        date: Date;
        accountId: string;
        categoryId: string | null;
        receiptUrl: string | null;
        receiptPublicId: string | null;
    }>;
    getAll(userId: string, filters: any): Promise<({
        account: {
            userId: string;
            type: import("@prisma/client").$Enums.AccountType;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            balance: Prisma.Decimal;
        };
        category: {
            userId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
        } | null;
    } & {
        userId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        description: string;
        date: Date;
        accountId: string;
        categoryId: string | null;
        receiptUrl: string | null;
        receiptPublicId: string | null;
    })[]>;
    delete(userId: string, id: string): Promise<{
        success: boolean;
    }>;
}
declare const _default: TransactionService;
export default _default;
