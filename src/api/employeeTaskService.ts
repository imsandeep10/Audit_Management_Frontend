import type { EmployeeResponse } from "../types/employees";
import axiosInstance from "./axiosInstance";


export const EmployeeTaskService = {
    async getTaskByEmployeeId(employeeId: string) {
        const response = await axiosInstance.get(`/task/${employeeId}/tasks`);
        return response.data?.tasks;
    },

    async updateSubTaskStatus(taskId: string, subTaskId: string, status: string) {
        const response = await axiosInstance.patch(`/task/${taskId}/subtask/${subTaskId}`, { status });
        return response.data?.task;
    },
    async updateTaskStatus(taskId: string, status: string) {
        const response = await axiosInstance.patch(`/task/${taskId}/status`, { status });
        return response.data?.task;
    },

    async getEmployeeData(employeeId: string): Promise<EmployeeResponse> {
        const response = await axiosInstance.get(`/employee/getemployee/${employeeId}`);
        return response.data;
    },

    async addSubTaskNote(taskId: string, subTaskId: string, note: string) {
        const response = await axiosInstance.post(`/task/${taskId}/subtask/${subTaskId}/note`, { note });
        return response.data?.task;
    }
}