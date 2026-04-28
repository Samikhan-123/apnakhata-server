import { z } from "zod";
import { Frequency, LedgerEntryType } from "@prisma/client";

export const CreateRecurringSchema = z.object({
  categoryId: z.string().cuid("Invalid category ID").optional().nullable(),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000000, "Amount too large"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(100, "Description must be within 100 characters")
    .regex(
      /^[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
      "Special icons and emojis are not allowed",
    ),
  type: z
    .nativeEnum(LedgerEntryType)
    .refine((type) => type !== "TRANSFER", {
      message: "TRANSFER is not allowed",
    }),
  frequency: z
    .nativeEnum(Frequency)
    .refine((frequency) => frequency !== "TEN_SECONDS", {
      message: "TEN_SECONDS is not allowed",
    }),
  nextExecution: z.string().min(1, "First payment date is required"),
});

export type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;
