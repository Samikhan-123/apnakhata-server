import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(50),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['BUG', 'FEEDBACK', 'HELP', 'OTHER']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  clientTimestamp: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
