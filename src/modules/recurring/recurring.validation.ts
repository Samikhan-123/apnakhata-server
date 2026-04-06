import { z } from 'zod';
import { Frequency, LedgerEntryType } from '@prisma/client';

export const CreateRecurringSchema = z.object({
  categoryId: z.string().cuid().optional(),
  amount: z.number().positive().max(1000000000000), // 1 Trillion
  description: z.string().min(3).max(100),
  type: z.nativeEnum(LedgerEntryType).refine((type) => type !== 'TRANSFER', { message: 'TRANSFER is not allowed' }),
  frequency: z.nativeEnum(Frequency).refine((frequency) => frequency !== 'TEN_SECONDS', { message: 'TEN_SECONDS is not allowed' }),
});

export type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;
