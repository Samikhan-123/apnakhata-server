import { z } from "zod";

// schema for budget validation
export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  limit: z
    .number()
    .positive("Limit must be a positive number")
    .max(1000000000, "Limit too large"),
  month: z.number().min(1, "Invalid month").max(12, "Invalid month"),
  year: z
    .number()
    .min(2000, "Year too far in past")
    .max(2100, "Year too far in future"),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
