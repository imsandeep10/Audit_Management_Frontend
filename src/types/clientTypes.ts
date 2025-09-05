import type { Image } from "../lib/types";
import type { Task, Employee, User, Document } from "./api";

// Re-export for convenience
export type { Task, Employee, User, Document };

// TaskCardProps interface for the TaskCard component
export interface TaskCardProps {
  _id: string;
  taskTitle: string;
  description: string;
  status: string;
  assignedTo: Array<{
    _id: string;
    user?: {
      _id: string;
      fullName: string;
      email: string;
    };
    fullName?: string;
    email?: string;
    position?: string;
  }>;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  client: {
    _id: string;
    companyName: string;
    registrationNumber?: number;
    clientNature?: string;
  };
  employee: {
    _id: string;
    user?: {
      _id: string;
      fullName: string;
      email: string;
    };
    fullName?: string;
    email?: string;
    position?: string;
  };
  color?: string;
  progress?: number;
  total?: number;
  avatars?: string[];
  subTasks?: Array<{
    _id: string;
    taskTitle: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Filter options
export type FilterOption = "default" | "asc" | "desc" | "reverse";

// Updated TasksResponse interfaces
export interface TasksResponse {
  success: boolean;
  task: Task;
  message?: string;
}

export interface TasksListResponse {
  success: boolean;
  tasks: Task[];
  message?: string;
}

export interface ClientsResponse {
  success?: boolean;
  clients: Array<{
    _id: string;
    VCTSID?: string;
    IRDID?: string;
    OCRID?: string;
    companyName: string;
    registrationNumber?: string;
    clientNature?: string;
    status?: "active" | "inactive";
    assignedEmployees: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    user: {
      _id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
      address: string;
      DOB: string;
      role: string;
      profileImageId: Image | null;
    } | null;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalClients: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  message?: string;
}

// lib/types.ts

export interface Client {
  _id: string;
  VCTSID?: string;
  IRDID?: string;
  OCRID?: string;
  assignedEmployees: string[]; // Array of employee IDs
  companyName: string;
  createdAt: string;
  registrationNumber?: string;
  clientNature?: string;
  status?: "active" | "inactive";
  updatedAt: string;
  user: User | null;
  __v: number;
}

// Form data interface for creating/updating clients
export interface ClientFormData {
  fullName: string;
  email: string;
  password: string;
  DOB: string;
  profileImageId: string;
  address: string;
  phoneNumber: string;
  clientNature: string;
  companyName: string;
  registrationNumber: string;
  IRDID: string;
  irdPassword: string;
  OCRID: string;
  ocrPassword: string;
  VCTSID: string;
  vctsPassword: string;
  role: "client";
  status: "active" | "inactive";
  fillingperiod?: string;
  indexFileNumber?: string;
  IRDoffice?: string;
  auditFees?: string;
  extraCharges?: string;
  dateOfTaxRegistration?: string;
  dateOfVatRegistration?: string;
  dateOfExciseRegistration?: string;
}

// Document types are now imported from api.ts

export interface DocumentTypeStat {
  _id: string;
  count: number;
}

export interface BillAmountStats {
  totalAmount: number;
  salesTotal: number;
  purchaseTotal: number;
  salesCount: number;
  purchaseCount: number;
}

export interface CustomerTotal {
  _id: {
    customerName: string;
    billType: "sales" | "purchase";
    registrationType: "pan" | "vat";
  };
  totalAmount: number;
  billCount: number;
  customerPan?: string;
  phoneNumber?: number;
}

export interface DocumentsResponse {
  documents: Document[];
  bills: Bill[];
  billTypes?: BillType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDocuments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
  documentTypeStats: DocumentTypeStat[];
  billAmountStats?: BillAmountStats;
  customerTotals?: CustomerTotal[];
  filters: {
    documentType: string;
    search: string;
    sortBy: string;
    sortOrder: string;
  };
}

export interface BillDocument {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  documentType: string;
  uploadDate: string;
  uploadDateFormatted?: string;
}

export interface Bill {
  id: string;
  billType: "sales" | "purchase";
  documentType: "pan" | "vat";
  registrationType?: "pan" | "vat";
  billNo?: string;
  customerBillNo?: string;
  customerName: string;
  billDate: string;
  customerPan?: string;
  phoneNumber?: number;
  amount?: number;
  documents: BillDocument[];
}

export interface BillType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  data: {
    deletedDocument: {
      id: string;
      originalName: string;
      documentType: string;
    };
  };
}

// Re-export API types for convenience
export type { ApiResponse, ValidationError, ServerErrorResponse } from "./api";

// Your form data type (ClientFormData)
export interface ClientFormDataProps {
  fullName: string;
  email: string;
  password?: string;
  DOB: string;
  profileImageId: string;
  address: string;
  phoneNumber: string;
  clientNature: string;
  companyName: string;
  registrationNumber: string;
  IRDID: string;
  irdPassword: string;
  OCRID: string;
  ocrPassword: string;
  VCTSID: string;
  vctsPassword: string;
  role: string;
  status: string;
  fillingperiod: string;
  indexFileNumber: string;
  IRDoffice: string;
  auditFees: string;
  extraCharges: string;
  dateOfTaxRegistration: string;
  dateOfVatRegistration: string;
  dateOfExciseRegistration: string;
}
