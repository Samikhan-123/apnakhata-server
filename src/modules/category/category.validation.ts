import { z } from 'zod';

// schema for category validation
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(20, 'Category name must be within 20 characters'),
  icon: z.string().min(1, 'Icon selection is required'),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
