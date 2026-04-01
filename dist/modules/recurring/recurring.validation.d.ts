import { z } from 'zod';
export declare const CreateRecurringSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    description: z.ZodString;
    type: z.ZodEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
        TRANSFER: "TRANSFER";
    }>;
    frequency: z.ZodEnum<{
        TEN_SECONDS: "TEN_SECONDS";
        DAILY: "DAILY";
        WEEKLY: "WEEKLY";
        MONTHLY: "MONTHLY";
        YEARLY: "YEARLY";
    }>;
}, z.core.$strip>;
export type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;
