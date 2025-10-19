import type {
  ApiResponse,
  TasksResponse,
  TasksListResponse,
} from "../types/clientTypes";
import type { TaskSubmitData } from "../types/task";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";

export const taskService = {
  async createTask(data: TaskSubmitData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/task/create-task",
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

    async createSingleMaskebariTask(data: TaskSubmitData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/task/create-single-maskebari",
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


  async createMaskebari(data: TaskSubmitData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/task/create-maskebari",
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

  async getTasks(status?: string): Promise<TasksListResponse> {
    const url = status ? `/task/get-tasks?status=${status}` : "/task/get-tasks";
    const response = await axiosInstance.get<TasksListResponse>(url);
    return response.data;
  },

  async getTaskById(id?: string): Promise<TasksResponse> {
    try {
      const response = await axiosInstance.get<TasksResponse>(
        `/task/get-task-by-id?id=${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Task ID is required");
    }
  },

  async deleteTaskById(taskId: string) {
    const response = await axiosInstance.delete(`/task/${taskId}`);
    return response.data;
  },

  async updateTask(taskId: string, data: TaskSubmitData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.patch<ApiResponse>(
        `/task/${taskId}`,
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
  async getTasksByClientId(clientId: string): Promise<TasksListResponse> {
    try {
      const response = await axiosInstance.get<TasksListResponse>(
        `/task/client/${clientId}/tasks`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw error;
      }
      throw error;
    }
  },

  async updateTaskWithITREstimatedData(
    taskId: string, 
    data: {
      fiscalYear?: string;
      taxableAmount?: number;
      taxAmount?: number;
      taskAmount?: number;
      estimatedRevenue?: number;
      netProfit?: number;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.patch<ApiResponse>(
        `/task/${taskId}/itr-estimated-data`,
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
};


