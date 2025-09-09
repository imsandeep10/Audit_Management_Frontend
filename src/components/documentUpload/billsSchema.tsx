import { z } from "zod";

// Base validation schemas
export const documentTypeSchema = z.enum(["pan", "vat"]);
export const registrationTypeSchema = z.enum(["pan", "vat"]);
export const customerPanSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{9}$/.test(val), "PAN must be exactly 9 digits");

// Phone number validation for both mobile and landline
const phoneNumberSchema = z.union([
  // Mobile numbers: 98XXXXXXXX or 97XXXXXXXX (10 digits)
  z.number().min(9700000000, "Invalid phone number").max(9899999999, "Invalid phone number"),
  // Landline numbers: typically 6-8 digits (without area code) or with leading 0
  z.number().min(1000000, "Landline number too short").max(99999999, "Landline number too long")
]).refine((val) => {
  const str = val.toString();
  // Mobile: starts with 97 or 98 and is 10 digits
  if (str.startsWith('97') || str.startsWith('98')) {
    return str.length === 10;
  }
  // Landline: 6-8 digits or starts with 0 followed by 6-8 digits
  return str.length >= 6 && str.length <= 9;
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