import { z } from 'zod';
export const ledgerEntryTypeSchema = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);
const baseLedgerEntrySchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    date: z.string().datetime().optional().default(new Date().toISOString()),
    type: ledgerEntryTypeSchema,
    categoryId: z.string().cuid('Invalid category ID').optional().nullable(),
    tags: z.array(z.string()).optional(),
});
export const createLedgerEntrySchema = baseLedgerEntrySchema.superRefine((data, ctx) => {
    if (data.type === 'INCOME') {
        const validSources = ['salary', 'business', 'freelance'];
        const desc = data.description.toLowerCase();
        if (!validSources.includes(desc)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Income source must be 'Salary', 'Business', or 'Freelance'",
                path: ['description']
            });
        }
    }
    else if (data.type === 'EXPENSE') {
        if (!data.categoryId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Category is required for expenses",
                path: ['categoryId']
            });
        }
    }
});
export const updateLedgerEntrySchema = baseLedgerEntrySchema.partial();
export const ledgerEntryFiltersSchema = z.object({
    startDate: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
    endDate: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
    categoryId: z.preprocess((val) => (val === '' || val === 'all' ? undefined : val), z.string().cuid().optional()),
    type: z.preprocess((val) => (val === '' || val === 'all' ? undefined : val), ledgerEntryTypeSchema.optional()),
    search: z.preprocess((val) => (val === '' ? undefined : val), z.string().optional()),
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('20').transform(Number),
});
//# sourceMappingURL=ledger-entry.validation.js.map