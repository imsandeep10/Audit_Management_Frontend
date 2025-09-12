import type { AxiosProgressEvent } from "axios";
import type { FileWithPreview } from "../types/uploadFile";
import axiosInstance from "./axiosInstance";

// Types
export type DocumentType = "pan" | "vat";
export type RegistrationType = "pan" | "vat";
export type BillType = "sales" | "purchase";

export interface UploadProgressItem {
    progress: number;
    loaded: number;
    total: number; // Changed from number | undefined to number
}

export type UploadProgress = Record<string, UploadProgressItem>;

export interface FileUploadResponse {
    success: boolean;
    message?: string;
    data: Array<{
        id: string;
        filename: string;
        originalName: string;
        size: number;
        documentType: string;
        documentURL: string;
        url: string;
        uploadDate: string;
        uploadedBy: string;
    }>;
}

export interface BillCreateResponse {
    success: boolean;
    bill: {
        id: string;
        billType: BillType;
        documentType: DocumentType;
        customerName: string;
        billDate: string;
        billNo?: string;
        customerBillNo?: string;
        customerPan?: string;
        documentIds: string[];
        documents?: Array<{
            _id: string;
            filename: string;
            originalName: string;
            documentURL?: string;
            size: number;
            uploadDate: string;
        }>;
        clientId: string;
        amount?: number;
        phoneNumber?: number;
        registrationType?: RegistrationType;
    };
    message?: string;
}

export interface BillUpdateResponse {
    success: boolean;
    bill: {
        id: string;
        billType: BillType;
        documentType: DocumentType;
        customerName: string;
        billDate: string;
        billNo?: string;
        customerBillNo?: string;
        customerPan?: string;
        documentIds: string[];
        documents?: Array<{
            _id: string;
            filename: string;
            originalName: string;
            documentURL?: string;
            size: number;
            uploadDate: string;
        }>;
        clientId: string;
        amount?: number;
        phoneNumber?: number;
        registrationType?: RegistrationType;
    };
    message?: string;
}

export interface GetBillResponse {
    success: boolean;
    bill: {
        _id: string;
        billType: BillType;
        documentType: DocumentType;
        customerName: string;
        billDate: string;
        billNo?: string;
        customerBillNo?: string;
        customerPan?: string;
        documentIds: Array<{
            _id: string;
            filename: string;
            originalName: string;
            documentURL?: string;
            size: number;
            uploadDate: string;
        }>;
        clientId: string;
        amount?: number;
        phoneNumber?: number;
        registrationType?: RegistrationType;
        fiscalYear?: string;
        createdAt: string;
        updatedAt: string;
    };
    message?: string;
}

export interface BillRecordData {
    documentType: DocumentType;
    customerName: string;
    billDate: string;
    customerPan?: string;
    billNo?: string;
    customerBillNo?: string;
    amount? : number;
    phoneNumber?: number;
    registrationType?: RegistrationType;
}

export interface UploadFilesParams {
    files: FileWithPreview[];
    documentType: DocumentType;
    billType: BillType;
    clientId: string;
    onUploadProgress?: (progressEvent: AxiosProgressEvent, progressKey: string) => void;
}

export interface CreateBillParams {
    billData: BillRecordData;
    documentIds: string[];
    billType: BillType;
    clientId: string;
}

export interface UpdateBillParams {
    billId: string;
    billData: BillRecordData;
    documentIds: string[];
    billType: BillType;
}

export interface DeleteBillResponse {
    success: boolean;
    message: string;
    data?: {
        deletedBillId: string;
        billType: BillType;
        customerName: string;
    };
}

interface CreateBillPayload extends BillRecordData {
    billType: BillType;
    documentIds: string[];
    billNo?: string;
    customerBillNo?: string;
    amount?: number;
    phoneNumber?: number;
    registrationType?: RegistrationType;
}

export async function uploadFiles({
    files,
    documentType,
    billType,
    clientId,
    onUploadProgress,
}: UploadFilesParams): Promise<string[]> {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => {
        formData.append("documents", file);
    });

    formData.append("documentType", documentType);
    formData.append("billType", billType);

    const progressKey = `${billType}_${documentType}`;

    const response = await axiosInstance.post<FileUploadResponse>(
        `/files/documents/${clientId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total && onUploadProgress) {
                    onUploadProgress(progressEvent, progressKey);
                }
            },
        }
    );

    return response.data.data?.map((doc) => doc.id) || [];
}

export async function createBill({
    billData,
    documentIds,
    billType,
    clientId,
}: CreateBillParams): Promise<BillCreateResponse> {
    const payload: CreateBillPayload = {
        billType,
        documentType: billData.documentType,
        customerName: billData.customerName,
        billDate: billData.billDate,
        customerPan: billData.customerPan || undefined,
        documentIds,
        amount: billData.amount || undefined,
        phoneNumber: billData.phoneNumber || undefined,
        registrationType: billData.registrationType || undefined,
    };

    if (billType === "sales" && "billNo" in billData) {
        payload.billNo = billData.billNo;
    } else if (billType === "purchase" && "customerBillNo" in billData) {
        payload.customerBillNo = billData.customerBillNo;
    }

    const response = await axiosInstance.post<BillCreateResponse>(
        `/client/bills/${clientId}`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

        return response.data;
    }

export async function updateBill({
    billId,
    billData,
    documentIds,
    billType,
}: UpdateBillParams): Promise<BillUpdateResponse> {
    const payload: CreateBillPayload = {
        billType,
        documentType: billData.documentType,
        customerName: billData.customerName,
        billDate: billData.billDate,
        customerPan: billData.customerPan || undefined,
        documentIds,
        amount: billData.amount || undefined,
        phoneNumber: billData.phoneNumber || undefined,
        registrationType: billData.registrationType || undefined,
    };

    if (billType === "sales" && "billNo" in billData) {
        payload.billNo = billData.billNo;
    } else if (billType === "purchase" && "customerBillNo" in billData) {
        payload.customerBillNo = billData.customerBillNo;
    }

    const response = await axiosInstance.patch<BillUpdateResponse>(
        `/client/bills/${billId}`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
}

export async function getBillById(billId: string): Promise<GetBillResponse> {
    const response = await axiosInstance.get<GetBillResponse>(
        `/client/bills/${billId}`
    );

    return response.data;
}

  export const deleteBill = async (billId: string): Promise<DeleteBillResponse> => {
        const response = await axiosInstance.delete<DeleteBillResponse>(
            `/client/bills/${billId}`
        );

        return response.data;
    }

export interface CustomerSuggestion {
    customerPan: string;
    customerName: string;
    billType: BillType;
    documentType: DocumentType;
    registrationType: RegistrationType;
    lastUsed?: string;
    phoneNumber?: number;
}

export interface CustomerSuggestionsResponse {
    success: boolean;
    message: string;
    data: CustomerSuggestion[];
}

export async function getCustomerSuggestions(clientId: string): Promise<CustomerSuggestion[]> {
    const response = await axiosInstance.get<CustomerSuggestionsResponse>(
        `/client/${clientId}/customer-suggestions`
    );

    return response.data.data || [];
}
