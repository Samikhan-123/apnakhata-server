import { z } from 'zod';

// schema for category validation
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
