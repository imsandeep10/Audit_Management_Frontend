import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/clientTypes";
import type { EmployeeFormData } from "./apis";
import type { AxiosError } from "axios";
import type { EmployeePasswordForm, SendMailForm } from "../pages/settings/Settings";

interface ErrorResponse {
  message?: string;
}

export const employeeService = {
  async getEmployees(page: number) {
    const response = await axiosInstance.get(
      `/employee/employees?page=${page}`
    );
    return response;
  },

  async createEmployee(data: EmployeeFormData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post("/employee/register", data);

      if (response.status === 201 || response.status === 200) {
        return {
          success: true,
          message: response.data.message || "Employee created successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to create employee",
        };
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Create employee error:", axiosError);
      return {
        success: false,
        message:
          axiosError?.response?.data?.message || "Failed to create employee",
      };
    }
  },

   async sendMail(data: SendMailForm) {
    try {
      const response = await axiosInstance.post("/mail", data);

      if (response.status === 201 || response.status === 200) {
        return {
          success: true,
          message: response.data.message || "mail Sent successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to send mail",
        };
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(" mail send error:", axiosError);
      return {
        success: false,
        message:
          axiosError?.response?.data?.message || "Failed to send mail",
      };
    }
  },

  async getAllEmployees() {
    const response = await axiosInstance.get("/employee/getemployees");
    return response;
  },

  async updateEmployee(
    data: EmployeeFormData,
    id: string
  ): Promise<ApiResponse> {
    try {
      const updateData = { ...data };

      delete (updateData as Record<string, unknown>)._id;
      delete (updateData as Record<string, unknown>).__v;
      delete (updateData as Record<string, unknown>).createdAt;
      delete (updateData as Record<string, unknown>).updatedAt;

      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key as keyof EmployeeFormData] === undefined ||
          updateData[key as keyof EmployeeFormData] === null ||
          updateData[key as keyof EmployeeFormData] === ""
        ) {
          delete (updateData as Record<string, unknown>)[key];
        }
      });

      const url = `/employee/update/${id}`;

      const response = await axiosInstance.put(url, updateData);

      if (response.status === 200) {
        return {
          success: true,
          message: response.data.message || "Employee updated successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to update employee",
        };
      }
    } catch (error: unknown) {
      console.error("=== UPDATE EMPLOYEE ERROR ===");
      console.error("Full error:", error);

      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Response status:", axiosError?.response?.status);
      console.error("Response data:", axiosError?.response?.data);
      console.error("Request URL:", axiosError?.config?.url);
      console.error("Request method:", axiosError?.config?.method);

      return {
        success: false,
        message:
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          "Failed to update employee",
      };
    }
  },

  async getEmployeeById(id: string) {
    const response = await axiosInstance.get(`/employee/getemployee/${id}`);
    return response;
  },
  async updateEmployeePassword(data: EmployeePasswordForm) {
    const response = await axiosInstance.patch(
      "employee/update-employee-password",
      data
    );
    return response.data;
  },
};
