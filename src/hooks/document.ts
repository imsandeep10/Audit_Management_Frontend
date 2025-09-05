import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { DashboardService } from "../api/dashboardService";
import type { DeleteDocumentResponse } from "../types/clientTypes";
import { toast } from "sonner";
import axiosInstance from "../api/axiosInstance";


export type Document = {
  id: string;
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  documentType: string;
  size: number;
  mimetype: string;
  description?: string;
  uploadDate: string;
  status: string;
  client?: {
    id: string;
    companyName: string;
    contactPerson?: {
      name: string;
      email?: string;
      phone?: string;
    };
    email?: string;
    phone?: string;
  };
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  bills?: Array<{
    id: string;
    billType: 'sales' | 'purchase';
    documentType: 'pan' | 'vat';
    billNo?: string;
    customerBillNo?: string;
    customerName: string;
    customerPan?: string;
    billDate: string;
  }>;
};

export type PaginatedDocuments = {
  documents: Document[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDocuments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export const documentTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'tax_clearance', label: 'Tax Clearance' },
  { value: 'registration', label: 'Registration' },
  { value: 'pan', label: 'PAN' },
  { value: 'vat', label: 'VAT' },
  { value: 'audit_report', label: 'Audit Report' },
  // { value: 'financial_statement', label: 'Financial Statement' },
  // { value: 'contract', label: 'Contract' },
  // { value: 'invoice', label: 'Invoice' },
  // { value: 'receipt', label: 'Receipt' },
  // { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'other', label: 'Other' },
  // { value: 'general', label: 'General' },
];

export const billTypes = [
  { value: 'all', label: 'All Bill Types' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchase', label: 'Purchase' },
];

export const documentCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'pan', label: 'PAN' },
  { value: 'vat', label: 'VAT' },
];


export const useDocuments = (params: Record<string, any> = {}) => {
  return useQuery<PaginatedDocuments>({
    queryKey: ['documents', params],
    queryFn: () => DashboardService.getAllDocuments(params),
    placeholderData: keepPreviousData,
  });
};


export const deleteDocument = (documentId: string) => {
  return useMutation<DeleteDocumentResponse, Error, string>({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`/files/documents/delete/${documentId}`);
      return response.data;
    },
    onSuccess: (data: DeleteDocumentResponse) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};