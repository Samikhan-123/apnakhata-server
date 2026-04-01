import { z } from 'zod';
export declare const ledgerEntryTypeSchema: z.ZodEnum<{
    INCOME: "INCOME";
    EXPENSE: "EXPENSE";
    TRANSFER: "TRANSFER";
}>;
export declare const createLedgerEntrySchema: z.ZodObject<{
    amount: z.ZodNumber;
    description: z.ZodString;
    date: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    type: z.ZodEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
        TRANSFER: "TRANSFER";
    }>;
    categoryId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateLedgerEntrySchema: z.ZodObject<{
    amount: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodString>>>;
    type: z.ZodOptional<z.ZodEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
        TRANSFER: "TRANSFER";
    }>>;
    categoryId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const ledgerEntryFiltersSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        INCOME: "INCOME";
        EXPENSE: "EXPENSE";
        TRANSFER: "TRANSFER";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodPipe<z.ZodDefault<z.ZodOptional<z.ZodString>>, z.ZodTransform<number, string>>;
    limit: z.ZodPipe<z.ZodDefault<z.ZodOptional<z.ZodString>>, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export type CreateLedgerEntryInput = z.infer<typeof createLedgerEntrySchema>;
export type UpdateLedgerEntryInput = z.infer<typeof updateLedgerEntrySchema>;
export type LedgerEntryFilters = z.infer<typeof ledgerEntryFiltersSchema>;
