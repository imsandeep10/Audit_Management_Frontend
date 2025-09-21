import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/clientTypes";
import type { ClientTypesResponse } from "../types/clientTypes";
import { type ClientFormData } from "../schemas/clientValidation";
import { AxiosError } from "axios";
export interface MaskebariAmountsProps{
  maskebariDate: string;
  vatableSales: number;
  vatFreeSales: number;
  vatablePurchase: number;
  customPurchase: number;
  vatFreePurchase: number;
  creditRemainingBalance: number;
  clientId: string;
  taskId:String
}
export const clientService = {
  async createClient(data: ClientFormData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/client/register",
        data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error;
      }
      throw error;
    }
  },

  async getClients(page: number = 0, limit: number = 5) {
    const response = await axiosInstance.get("/client/get-clients", {
      params: { page, limit },
    });
    return response.data;
  },

  async filterClients(filters: {
    clientNature?: string;
    irdOffice?: string;
    fillingPeriod?: string;
    registerUnder?: string;
    clientType?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axiosInstance.get("/client/filter", {
      params: filters,
    });
    return response.data;
  },

  async getFilterOptions() {
    const response = await axiosInstance.get("/client/filter-options");
    return response.data;
  },

  async getClientStatistics(filterType?: string) {
    const params = filterType ? { filterType } : {};
    const response = await axiosInstance.get("/client/reports/statistics", { params });
    return response.data;
  },

  async uploadDocumentAPI(clientId: string, formData: FormData) {
    const response = await axiosInstance.post(
      `/files/documents/${clientId}`,
      formData
    );
    return response.data;
  },

async getAllClients() {
  const response = await axiosInstance.get(`/client/clients`);
  return response;
},
async getClientTypes(): Promise<ClientTypesResponse> {
  const response = await axiosInstance.get(`/client/client-types`);
  return response.data;
},  async getClient(clientId: string) {
    const response = await axiosInstance.get(`client/${clientId}`);
    return response.data;

  },

  async updateClient(clientId: string, data: ClientFormData) {
    const response = await axiosInstance.put(`client/update/${clientId}`, data);
    return response.data;
  },

  async addAmount(data: MaskebariAmountsProps) {
    const response = await axiosInstance.post(`amounts/add-amounts`, data);
    return response.data;
  },
  async updateAmount(data: MaskebariAmountsProps) {
    const response = await axiosInstance.patch(`amounts/update-amounts`, data);
    return response.data;
  },
    async getAmounts() {
    const response = await axiosInstance.get(`amounts/get-all-maskebari`);
    return response.data;
  },
  async getAmountsbyTaskId(taskId: string) {
    const response = await axiosInstance.get(`amounts/get-maskebari-by-task-id/${taskId}`);
    return response.data;
  },
  async uploadBulkClient(formData: FormData) {
    const response = await axiosInstance.post(`client/bulk-upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // get one of client document by id
  async getDocumentById(documentId: string) {
    const response = await axiosInstance.get(`/files/document/${documentId}`);
    return response.data.data || null;
  },
};
