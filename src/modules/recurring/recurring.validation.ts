import { z } from 'zod';
import { Frequency, LedgerEntryType } from '@prisma/client';

export const CreateRecurringSchema = z.object({
  categoryId: z.string().cuid().optional(),
  amount: z.number().positive(),
  description: z.string().min(3),
  type: z.nativeEnum(LedgerEntryType),
  frequency: z.nativeEnum(Frequency),
});

export type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;
