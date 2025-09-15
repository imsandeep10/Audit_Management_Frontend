import axiosInstance from "./axiosInstance";

export const reportService = {
  async getReportSummary() {
    const response = await axiosInstance.get("/report/completion");
    return response;
  },
  async getMonthlyReport() {
    const response = await axiosInstance.get("/report/monthly");
    return response;
  },
  async getMonthlyUserReport() {
    const response = await axiosInstance.get("/report/user-monthly");
    return response;
  },

  async updateITRByTaskId(taskId: string, itrData: {
    taxableAmount?: number;
    taxAmount?: number;
    taskAmount?: number;
  }) {
    const response = await axiosInstance.patch(`/report/itr/${taskId}`, { itrData });
    return response?.data ?? response;
  },

  async updateEstimatedReturnByTaskId(taskId: string, estimatedReturnData: {
    estimatedRevenue?: number;
    netProfit?: number;
  }) {
    const response = await axiosInstance.patch(`/report/estimated-return/${taskId}`, { estimatedReturnData });
    return response?.data ?? response;
  },
};
