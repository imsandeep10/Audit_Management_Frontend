import type { BillType } from "../../api/BillsService";
import type { DocumentType, RegistrationType } from "./billsSchema";
import type { FileWithPreview } from "../../types/uploadFile";

// Document type options
export const DOCUMENT_TYPE_OPTIONS = [
  { value: "pan" as DocumentType, label: "PAN" },
  { value: "vat" as DocumentType, label: "VAT" },
] as const;

// Registration type options
export const REGISTRATION_TYPE_OPTIONS = [
  { value: "pan" as RegistrationType, label: "PAN" },
  { value: "vat" as RegistrationType, label: "VAT" },
] as const;

// Bill type options
export const BILL_TYPE_OPTIONS = [
  { value: "sales" as BillType, label: "Sales" },
  { value: "purchase" as BillType, label: "Purchase" },
] as const;

// Default form values
export const DEFAULT_SALES_VALUES = {
  documentType: "pan" as DocumentType,
  customerName: "",
  billDate: "",
  billNo: "",
  customerPan: "",
  amount: 0,
  phoneNumber: "",
  files: [] as FileWithPreview[],
  documentIds: [],
  registrationType: "pan" as RegistrationType,
};

export const DEFAULT_PURCHASE_VALUES = {
  documentType: "pan" as DocumentType,
  customerName: "",
  billDate: "",
  customerBillNo: "",
  customerPan: "",
  amount: 0,
  phoneNumber: "",
  files: [] as FileWithPreview[],
  documentIds: [],
  registrationType: "pan" as RegistrationType,
};

// Error messages
export const ERROR_MESSAGES = {
  CUSTOMER_NAME_REQUIRED: "Customer name is required",
  BILL_DATE_REQUIRED: "Bill date is required",
  BILL_NO_REQUIRED: "Bill number is required",
  CUSTOMER_BILL_NO_REQUIRED: "Customer bill number is required",
  PAN_INVALID: "PAN must be exactly 9 digits",
  DOCUMENTS_REQUIRED: "Please upload documents first",
  UPLOAD_FAILED: "Failed to upload documents",
  BILL_CREATE_FAILED: "Failed to create bill. Please try again.",
  UNKNOWN_ERROR: "Unknown error occurred",
  AMOUNT_POSITIVE: "Amount must be a positive number",
  PHONE_NUMBER_REQUIRED: "Phone number is required",
  PHONE_NUMBER_INVALID: "Phone number must be 10 digits",
  REGISTRATION_TYPE_REQUIRED: "Registration type is required",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DOCUMENTS_UPLOADED: (billType: BillType, count: number) =>
    `${
      billType.charAt(0).toUpperCase() + billType.slice(1)
    } documents uploaded successfully! ${count} document(s) uploaded`,
  BILL_CREATED: (billType: BillType, count: number) =>
    `${
      billType.charAt(0).toUpperCase() + billType.slice(1)
    } bill created successfully with ${count} document(s)!`,
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  PAN_REGEX: /^\d{9}$/,
  NUMBERS_ONLY: /\D/g,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_HEIGHT: "90vh",
  PAN_MAX_LENGTH: 9,
  MIN_FILE_UPLOAD_HEIGHT: "120px",
  PROGRESS_BAR_HEIGHT: "2.5",

} as const;
