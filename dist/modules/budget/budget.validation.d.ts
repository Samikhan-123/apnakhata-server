import { z } from 'zod';
export declare const createBudgetSchema: z.ZodObject<{
    categoryId: z.ZodString;
    limit: z.ZodNumber;
    month: z.ZodNumber;
    year: z.ZodNumber;
}, z.core.$strip>;
export declare const updateBudgetSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    month: z.ZodOptional<z.ZodNumber>;
    year: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
