import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/clientTypes";
import { type ClientFormData } from "../schemas/clientValidation";
import { AxiosError } from "axios";

// Employee creation data type
export interface EmployeeFormData {
  id?: string;
  fullName: string;
  email: string;
  address: string;
  DOB: string;
  password: string;
  profileImage?: File;
  imageId?: string;
  phoneNumber: string;
  panNumber: string;
  documentType: string;
}

export const apiService = {
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

  async getEmployees() {
    const response = await axiosInstance.get("/employee/employees");
    return response.data;
  },

  async createEmployee(data: EmployeeFormData): Promise<ApiResponse> {
    const response = await axiosInstance.post("/employee/register", data);
    return response.data;
  },
  async uploadImage(image: File) {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axiosInstance.post("/files/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async createRoom(data: { employeeId: string }) {
    const response = await axiosInstance.post("/message/create-room", data);
    return response.data;
  },

  async getRooms() {
    const response = await axiosInstance.get("/message/rooms");
    return response.data;
  },

  // Message services
  async sendMessage({
    content,
    roomId,
    sender,
  }: {
    content: string;
    roomId: string;
    sender: string;
  }) {
    const response = await axiosInstance.post(`message/room/${roomId}`, {
      content,
      sender,
    });
    return response.data;
  },

  async getMessages(roomId: string) {
    const response = await axiosInstance.get(`/message/room/${roomId}`);
    return response.data;
  },

  async getUser() {
    const response = await axiosInstance.get("/user/getuser");

    return response.data;
  },
  async getClients() {
    const response = await axiosInstance.get("/client/get-clients");
    return response.data;
  },
};
