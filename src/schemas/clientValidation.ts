import { z } from "zod";
import { isAtLeast18YearsOld, isLikelyBSDate } from "../utils/date-validation";

export const ClientFormSchema = z.object({
  registeredUnder: z.string().refine(val => !val || ["vat", "pan"].includes(val), "Must be VAT or PAN").optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),

  DOB: z
    .string()
    .refine((date) => {
      if (!date) return true;
      const format = isLikelyBSDate(date) ? "BS" : "AD";
      return isAtLeast18YearsOld(date, format, 18);
    }, "Must be at least 18 years old")
    .optional(),

  clientType: z.string().min(1, "Client type is required"),
  profileImageId: z.string().optional(),

  address: z.string().min(5, "Address must be at least 5 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number should be 10 numbers")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),

  clientNature: z.string().min(2, "Client nature is required"),
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z
    .string()
    .optional(),

  IRDID: z.string().optional(),
  irdPassword: z.string().optional(),

  OCRID: z.string().optional(),
  ocrPassword: z.string().optional(),

  VCTSID: z.string().optional(),
  vctsPassword: z.string().optional(),

  // Changed from enum to string with validation for specific values
  fillingperiod: z
    .string()
    .refine(
      (value) => !value || ["monthly", "trimester"].includes(value),
      "Filling period must be monthly or trimester"
    )
    .optional(),

  indexFileNumber: z.string().optional(),
  IRDoffice: z.string().optional(),

  auditFees: z
    .string()
    .regex(/^\d+$/, { message: "Audit fees must be numeric" })
    .optional(),

  extraCharges: z
    .string()
    .regex(/^\d+$/, { message: "Extra charges must be numeric" })
    .optional(),

  dateOfTaxRegistration: z.string().optional(),
  dateOfVatRegistration: z.string().optional(),
  dateOfExciseRegistration: z.string().optional(),

  role: z.string(),
  status: z.string(),
  assignee: z.array(z.string()).optional(),
});

export type ClientFormData = z.infer<typeof ClientFormSchema>;

export {
  isValidDate,
  isNotFutureDate as isDateNotInFuture,
  isFutureDate as isDateInFuture,
  isAtLeast18YearsOld,
  validateDate,
  stringToBsDate,
  formatBsDate,
  prepareDateForBackend,
  isLikelyBSDate,
} from "../utils/date-validation";
