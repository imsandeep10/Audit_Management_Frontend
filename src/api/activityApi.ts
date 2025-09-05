import axiosInstance from "./axiosInstance";


export const activityApiService = {
    async getEmployeeActivities(employeeId: string, period: string, page: number = 1, limit: number = 10) {
        const response = await axiosInstance.get(`/activity/employee/${employeeId}/${period}?page=${page}&limit=${limit}`);
        return response.data;
    },

    async getAdminDashboardActivities(period: string, page: number, limit: number) {
        const response = await axiosInstance.get(`/activity/me/?period=${period}&page=${page}&limit=${limit}`);
        return response.data;
    },
}