import type { ApiResponse, ClientsResponse } from "../types/clientTypes";
import { type ClientFormData } from "../schemas/clientValidation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService, type MaskebariAmountsProps } from "./clientService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
interface UploadResult {
  success: boolean;
  message: string;
  summary?: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    successfulRegistrations: number;
    duplicates: number;
    errors: number;
  };
  details?: {
    parseErrors: string[];
    successful: Array<{
      row: number;
      email: string;
      fullName: string;
    }>;
    duplicates: Array<{
      row: number;
      email: string;
      message: string;
    }>;
    registrationErrors: Array<{
      row: number;
      email: string;
      error: string;
    }>;
  };
}
export const useClientMutations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createClientMutation = useMutation({
    mutationFn: clientService.createClient,
    onSuccess: (data: ApiResponse) => {
      if (data.success) {
        toast.success("Client created successfully!");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        navigate("/clients");
      } else {
        toast.error("Failed to create client. Please try again.");
      }
    },
    onError: (error: AxiosError) => {
      toast.error("Failed to create client", {
        description: error.message,
      });
    },
  });

  const createClient = async (data: ClientFormData) => {
    return createClientMutation.mutateAsync(data);
  };

  return {
    createClientMutation,
    createClient,
    isCreating: createClientMutation.isPending,
  };
};

export const useGetClients = (page: number = 0, limit: number = 5) => {
  const { data, isLoading, error, refetch } = useQuery<ClientsResponse, Error>({
    queryKey: ["clients", page, limit],
    queryFn: async () => {
      const response = await clientService.getClients(page, limit);
      return response;
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    clientCount: data?.clients?.length || 0,
  };
};

export const useGetAllClients = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getAllClients(),
  });
};

export const useGetClientById = (
  id: string,
  options?: { enabeled?: boolean }
) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => clientService.getClient(id),
    enabled: options?.enabeled ?? true,
  });
};

export const useGetAmountByCLientId = (
) => {
  return useQuery({
    queryKey: ["amount"],
    queryFn: () => clientService.getAmounts(),
  });
};
export const useClientUpdateMutations = () => {
  const queryClient = useQueryClient();

  const updateClientMutation = useMutation({
    mutationFn: ({
      clientId,
      data,
    }: {
      clientId: string;
      data: ClientFormData;
    }) => {
      return clientService.updateClient(clientId, data);
    },
    onSuccess: (data: ApiResponse) => {
      if (data.success) {
        toast.success("Client updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["client"] });
      } else {
        toast.error("Failed to update client. Please try again.");
      }
    },
    onError: (error: AxiosError) => {
      toast.error("Failed to update client", {
        description: error.message,
      });
    },
  });

  const updateClient = async (clientId: string, data: ClientFormData) => {
    return updateClientMutation.mutateAsync({ clientId, data });
  };

  return {
    updateClientMutation,
    updateClient,
    isUpdating: updateClientMutation.isPending,
  };
};

export const useBulkUploadMutation = () => {
  const queryClient = useQueryClient();

  const uploadClientsMutation = useMutation<UploadResult, AxiosError, FormData>(
    {
      mutationFn: (formData: FormData) => {
        return clientService.uploadBulkClient(formData);
      },
      onSuccess: (data: UploadResult) => {
        if (data.success) {
          toast.success("Clients uploaded successfully!", {
            description: `${
              data.summary?.successfulRegistrations || 0
            } clients registered successfully`,
          });
          queryClient.invalidateQueries({ queryKey: ["clients"] });
          queryClient.invalidateQueries({ queryKey: ["client"] });
        } else {
          toast.error("Upload completed with errors", {
            description: data.message,
          });
        }
      },
      onError: (error: AxiosError) => {
        console.error("Upload error:", error);
        // Safely extract error message
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          "Failed to upload clients";

        toast.error("Failed to upload clients", {
          description: errorMessage,
        });
      },
    }
  );

  const uploadClients = async (formData: FormData) => {
    return uploadClientsMutation.mutateAsync(formData);
  };

  return {
    uploadClientsMutation,
    uploadClients,
    isUploading: uploadClientsMutation.isPending,
  };
};


export const useCreateAmount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaskebariAmountsProps) => clientService.addAmount(data),
    onSuccess: () => {
      // Invalidate related queries so UI gets fresh data
      queryClient.invalidateQueries({ queryKey: ["amounts"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });

    },
  });
};

export const useUpdateAmount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaskebariAmountsProps) => clientService.addAmount(data),
    onSuccess: () => {
      // Invalidate related queries so UI gets fresh data
      queryClient.invalidateQueries({ queryKey: ["amounts"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });

    },
  });
};