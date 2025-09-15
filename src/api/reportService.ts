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
  async getITRReport(fiscalYear?: string) {
    const params = fiscalYear ? { fiscalYear } : {};
    const response = await axiosInstance.get("/report/itr", { params });
    return response;
  },
  async getEstimatedReturnReport(fiscalYear?: string) {
    const params = fiscalYear ? { fiscalYear } : {};
    const response = await axiosInstance.get("/report/estimated-return", { params });
    return response;
  },
};
