import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { DocumentsResponse, DeleteDocumentResponse } from '../types/clientTypes';
import { toast } from 'sonner';
import axiosInstance from '../api/axiosInstance';

export const useClientDocuments = (
  clientId: string,
  params: {
    page?: number;
    limit?: number;
    documentType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    nepaliMonth?: string;
    fiscalYear?: string;
    billDocumentType?: string;
    viewType?: string;
    salesPage?: number;
    purchasePage?: number;
    billsPerPage?: number;
  }
) => {
  return useQuery<DocumentsResponse>({
    queryKey: ['documents', clientId, params],
    queryFn: async () => {
      const response = await axiosInstance.get(`/files/clients/${clientId}/documents/enhanced`, {
        params: {
          page: params.page,
          limit: params.limit,
          documentType: params.documentType,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          nepaliMonth: params.nepaliMonth,
          fiscalYear: params.fiscalYear,
          billDocumentType: params.billDocumentType,
          viewType: params.viewType,
          salesPage: params.salesPage,
          purchasePage: params.purchasePage,
          billsPerPage: params.billsPerPage,
        },
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useDeleteDocument = (clientId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteDocumentResponse, Error, string>({
    mutationFn: async (documentId) => {
      const response = await axiosInstance.delete(`/files/documents/delete/${documentId}`);
      return response.data;
    },
    onSuccess: (data: DeleteDocumentResponse) => {
      queryClient.invalidateQueries({ queryKey: ['documents', clientId] });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDownloadDocumentsZip = () => {
  return useMutation<Blob, Error, { 
    clientId: string; 
    fiscalYear?: string; 
    documentType?: string; 
    search?: string; 
  }>({
    mutationFn: async (params) => {
      const response = await axiosInstance.get(
        `/files/clients/${params.clientId}/download/documents-zip`,
        {
          params: {
            fiscalYear: params.fiscalYear,
            documentType: params.documentType,
            search: params.search,
          },
          responseType: 'blob',
        }
      );
      return response.data;
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Documents_${variables.fiscalYear?.replace('/', '-') || 'All'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Documents downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to download documents');
    },
  });
};

export const useDownloadBillsExcel = () => {
  return useMutation<Blob, Error, { 
    clientId: string; 
    fiscalYear?: string; 
    nepaliMonth?: string; 
    billDocumentType?: string; 
    billType?: string; 
    search?: string; 
  }>({
    mutationFn: async (params) => {
      const response = await axiosInstance.get(
        `/files/clients/${params.clientId}/download/bills-excel`,
        {
          params: {
            fiscalYear: params.fiscalYear,
            nepaliMonth: params.nepaliMonth,
            billDocumentType: params.billDocumentType,
            billType: params.billType,
            search: params.search,
          },
          responseType: 'blob',
        }
      );
      return response.data;
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bills_${variables.fiscalYear?.replace('/', '-') || 'All'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Bills downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to download bills');
    },
  });
};