import axiosInstance from "./axiosInstance";
import { type PaginatedDocuments } from "../hooks/document";
import type { EmployeeProgress } from "../types/dashboard";

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalClients: number;
}



export const DashboardService = {
    async getTotalClients() {
        const response = await axiosInstance.get<ApiResponse<number>>("/dashboard/total-clients");
        return response.data;
    },
    async getTotalEmployees() {
        const response = await axiosInstance.get<ApiResponse<number>>("/dashboard/total-employees");
        return response.data;
    },

    async getTotalTasks() {
        const response = await axiosInstance.get<ApiResponse<number>>("/dashboard/total-tasks");
        return response.data;
    },

    async getTotalActivityLogs() {
        const response = await axiosInstance.get<ApiResponse<number>>("/dashboard/total-activity-logs");
        return response.data;
    },

    async getAllDocuments( params: Record<string, any> = {}): Promise<PaginatedDocuments> {
        const response = await axiosInstance.get<ApiResponse<PaginatedDocuments>>("/files/documents/all", {
            params,
        });
        return response.data.data!;
    },

    async getEmployeeProgress() {
        const response = await axiosInstance.get<ApiResponse<EmployeeProgress[]>>("/dashboard/assignment-progress");
        return response.data.data || [];
    },
}