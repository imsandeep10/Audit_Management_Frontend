import { z } from "zod";
import { isAtLeast18YearsOld } from "../utils/date-validation";

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must not exceed 200 characters"),
  position: z
    .string()
    .min(2, "Position must be at least 2 characters")
    .max(50, "Position must not exceed 50 characters"),
  DOB: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const isValid = isAtLeast18YearsOld(
        date,
        date.startsWith("20") ? "BS" : "AD"
      );
      return isValid;
    }, "Must be at least 18 years old"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  profileImageId: z.string().min(1, "Profile image is required"),
  documentType: z.enum(["citizenship", "passport", "panNumber"]),
  documentImageId: z.string().min(1, "Document image is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),

  panNumber: z.string().length(9, "PAN number must be exactly 9 characters"),

  role: z.string().min(1, "Role is required").default("employee"),
});

// For edit mode, only validate the fields that can be updated
export const editEmployeeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address must not exceed 200 characters"),
  position: z
    .string()
    .min(2, "Position must be at least 2 characters")
    .max(50, "Position must not exceed 50 characters"),
  DOB: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      // Explicitly check if the date meets the 18 years old requirement
      // This will handle both AD and BS dates
      const isValid = isAtLeast18YearsOld(
        date,
        date.startsWith("20") ? "BS" : "AD"
      );
      return isValid;
    }, "Must be at least 18 years old"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits"),
  panNumber: z.string().min(9, "PAN number must be  9 characters"),
  // Optional fields that won't be updated (read-only)
  password: z.string().optional(),
  profileImageId: z.string().optional(),
  documentType: z.enum(["citizenship", "passport", "panNumber"]).optional(),
  documentImageId: z.string().optional(),
  role: z.string().optional(),
});
