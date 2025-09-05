import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosProgressEvent } from "axios";
import {
  deleteBill,
  type BillRecordData,
  type BillType,
  type DocumentType,
  type UploadProgressItem,
} from "./BillsService";
import type { FileWithPreview } from "../types/uploadFile";
import { uploadFiles, createBill } from "./BillsService";

interface UseUploadFilesParams {
  onUploadStart: (billType: BillType) => void;
  onUploadEnd: (billType: BillType) => void;
  onProgressUpdate: (
    progressKey: string,
    progressItem: UploadProgressItem
  ) => void;
  onProgressClear: (progressKey: string) => void;
}

export const useUploadFiles = ({
  onUploadStart,
  onUploadEnd,
  onProgressUpdate,
  onProgressClear,
}: UseUploadFilesParams) => {
  return useMutation({
    mutationFn: async ({
      files,
      documentType,
      billType,
      clientId,
    }: {
      files: FileWithPreview[];
      documentType: DocumentType;
      billType: BillType;
      clientId: string;
    }) => {
      onUploadStart(billType);

      try {
        const documentIds = await uploadFiles({
          files,
          documentType,
          billType,
          clientId,
          onUploadProgress: (
            progressEvent: AxiosProgressEvent,
            progressKey: string
          ) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              onProgressUpdate(progressKey, {
                progress,
                loaded: progressEvent.loaded,
                total: progressEvent.total,
              });
            }
          },
        });

        const progressKey = `${billType}_${documentType}`;
        onProgressClear(progressKey);

        return documentIds;
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (error as Error)?.message ||
          "Unknown error occurred";

        toast.error(`Failed to upload ${billType} documents`, {
          description: errorMessage,
        });

        const progressKey = `${billType}_${documentType}`;
        onProgressClear(progressKey);

        throw error;
      } finally {
        onUploadEnd(billType);
      }
    },
  });
};

interface UseCreateBillParams {
  onSuccess: (result: {
    type: BillType;
    bill: import("./BillsService").BillCreateResponse["bill"];
    documentIds: string[];
  }) => void;
  onError?: (error: unknown) => void;
}

export const useCreateBill = ({ onSuccess, onError }: UseCreateBillParams) => {
  return useMutation({
    mutationFn: async ({
      billData,
      documentIds,
      billType,
      clientId,
    }: {
      billData: BillRecordData;
      documentIds: string[];
      billType: BillType;
      clientId: string;
    }) => {
      if (!documentIds.length) {
        throw new Error(`Please upload documents for ${billType} bill first`);
      }

      const result = await createBill({
        billData,
        documentIds,
        billType,
        clientId,
      });

      return {
        type: billType,
        bill: result.bill,
        documentIds,
      };
    },
    onSuccess: (result) => {
      onSuccess(result);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Unknown error occurred";

      toast.error(`Failed to create bill. Please try again.`, {
        description: errorMessage,
      });

      if (onError) {
        onError(error);
      }
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const response = await deleteBill(billId);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['documents'] // This will refresh the bills data
      });
      
      toast.success('Bill deleted successfully', {
        description: data.message,
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Unknown error occurred";

      toast.error(`Failed to delete bill`, {
        description: errorMessage,
      });
    },
  });
};
