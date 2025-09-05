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
  }
) => {
  return useQuery<DocumentsResponse>({
    queryKey: ['documents', clientId, params],
    queryFn: async () => {
      const response = await axiosInstance.get(`/files/clients/${clientId}`, {
        params: {
          page: params.page,
          limit: params.limit,
          documentType: params.documentType,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          nepaliMonth: params.nepaliMonth,
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