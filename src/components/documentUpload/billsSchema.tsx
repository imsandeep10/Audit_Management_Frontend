import { z } from "zod";

// Base validation schemas
export const documentTypeSchema = z.enum(["pan", "vat"]);
export const registrationTypeSchema = z.enum(["pan", "vat"]);
export const customerPanSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{9}$/.test(val), "PAN must be exactly 9 digits");

// Phone number validation for both mobile and landline (optional)
const phoneNumberSchema = z
  .string()
  .trim()
  .optional()
  // Allow empty/undefined values
  .refine((val) => !val || /^[0-9]+$/.test(val), "Invalid phone number format")
  .refine((val) => {
    if (!val) return true;
    // Mobile: starts with 97 or 98 and is 10 digits
    if (val.startsWith('97') || val.startsWith('98')) {
      return val.length === 10;
    }
    // Landline: 6-9 digits (allow leading 0)
    return val.length >= 6 && val.length <= 9;
  }, "Invalid phone number format");

// Sales bill schema
export const salesBillSchema = z.object({
  documentType: documentTypeSchema,
  customerName: z.string().min(1, "Customer name is required"),
  billDate: z.string().min(1, "Bill date is required"),
  billNo: z.string().min(1, "Bill number is required"),
  customerPan: customerPanSchema,
  files: z.array(z.instanceof(File)).optional(),
  documentIds: z.array(z.string()).optional(),
  amount: z.number().min(1, "Amount must be a positive number"),
  phoneNumber: phoneNumberSchema,
  registrationType: registrationTypeSchema,
});

// Purchase bill schema
export const purchaseBillSchema = z.object({
  documentType: documentTypeSchema,
  customerName: z.string().min(1, "Customer name is required"),
  billDate: z.string().min(1, "Bill date is required"),
  customerBillNo: z.string().min(1, "Customer bill number is required"),
  customerPan: customerPanSchema,
  files: z.array(z.instanceof(File)).optional(),
  documentIds: z.array(z.string()).optional(),
  amount: z.number().min(1, "Amount must be a positive number"),
  phoneNumber: phoneNumberSchema,
  registrationType: registrationTypeSchema,
});

// Combined bills schema
export const billsSchema = z.object({
  sales: salesBillSchema,
  purchase: purchaseBillSchema,
});

// Type exports
export type DocumentType = z.infer<typeof documentTypeSchema>;
export type RegistrationType = z.infer<typeof registrationTypeSchema>;
export type SalesBill = z.infer<typeof salesBillSchema>;
export type PurchaseBill = z.infer<typeof purchaseBillSchema>;
export type BillsFormData = z.infer<typeof billsSchema>;