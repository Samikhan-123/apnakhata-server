import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string(),
  limit: z.number().positive('Limit must be a positive number'),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
