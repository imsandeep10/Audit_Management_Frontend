import { z } from "zod";

// Schema for ITR task type
export const itrSchema = z.object({
  fiscalYear: z.string().min(1, "Fiscal Year is required"),
  taskAmount: z.coerce
    .number({
      message: "Must be a valid number",
    })
    .nonnegative("Total Turnover must be 0 or positive"),
  taxableAmount: z.coerce
    .number({
      message: "Must be a valid number",
    }),
  taxAmount: z.coerce
    .number({
      message: "Must be a valid number",
    })
    .nonnegative("Tax Amount must be 0 or positive"),
});

// Schema for Estimated Return task type
export const estimatedReturnSchema = z.object({
  fiscalYear: z.string().min(1, "Fiscal Year is required"),
  estimatedRevenue: z.coerce
    .number({
      message: "Must be a valid number",
    })
    .positive("Estimated Revenue must be greater than 0"),
  netProfit: z.coerce
    .number({
      message: "Must be a valid number",
    })
    .positive("Net Profit must be greater than 0"),
});

// Combined schema for ITR and Estimated Return
export const itrEstimatedSchema = z.object({
  fiscalYear: z.string().min(1, "Fiscal Year is required"),
  // ITR fields (optional when it's Estimated Return)
  taskAmount: z.coerce.number().optional(),
  taxableAmount: z.coerce.number().optional(),
  taxAmount: z.coerce.number().nonnegative("Tax Amount must be 0 or positive").optional(),
  // Estimated Return fields (optional when it's ITR)
  estimatedRevenue: z.coerce.number().optional(),
  netProfit: z.coerce.number().optional(),
});

export type ITRFormData = z.infer<typeof itrSchema>;
export type EstimatedReturnFormData = z.infer<typeof estimatedReturnSchema>;
export type ITREstimatedFormData = z.infer<typeof itrEstimatedSchema>;
