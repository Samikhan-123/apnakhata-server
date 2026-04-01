import { AccountType } from '@prisma/client';
export declare class AccountService {
    create(userId: string, name: string, type: AccountType, balance?: number): Promise<{
        userId: string;
        type: import("@prisma/client").$Enums.AccountType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
    }>;
    getAll(userId: string): Promise<{
        userId: string;
        type: import("@prisma/client").$Enums.AccountType;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
}
declare const _default: AccountService;
export default _default;
