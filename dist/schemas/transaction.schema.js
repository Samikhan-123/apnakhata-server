import { z } from 'zod';
export const createTransactionSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    date: z.string().datetime().optional().default(new Date().toISOString()),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    accountId: z.string().cuid('Invalid account ID'),
    categoryId: z.string().cuid('Invalid category ID').optional(),
    tags: z.array(z.string()).optional(),
});
export const updateTransactionSchema = createTransactionSchema.partial();
//# sourceMappingURL=transaction.schema.js.map