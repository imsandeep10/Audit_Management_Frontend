import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DashboardService } from "../api/dashboardService";

export const useDashboardStats = () => {
  const totalEmployees = useQuery({
    queryKey: ["dashboard", "totalEmployees"],
    queryFn: async () => {
      const response = await DashboardService.getTotalEmployees();
      return response.data;
    },
    staleTime: 1000 * 60 * 1,
    placeholderData: keepPreviousData,
  });

  const totalClients = useQuery({
    queryKey: ["dashboard", "totalClients"],
    queryFn: async () => {
      const response = await DashboardService.getTotalClients();
      return response.data;
    },
    staleTime: 1000 * 60 * 1,
    placeholderData: keepPreviousData,
  });

  const totalTasks = useQuery({
    queryKey: ["dashboard", "totalTasks"],
    queryFn: async () => {
      const response = await DashboardService.getTotalTasks();
      return response.data;
    },
    staleTime: 1000 * 60 * 1,
    placeholderData: keepPreviousData,
  });

  const totalActivityLogs = useQuery({
    queryKey: ["dashboard", "totalActivityLogs"],
    queryFn: async () => {
      const response = await DashboardService.getTotalActivityLogs();
      return response.data;
    },
    staleTime: 1000 * 60 * 1,
    placeholderData: keepPreviousData,
  });

  return {
    totalEmployees,
    totalClients,
    totalTasks,
    totalActivityLogs,
    isLoading:
      totalEmployees.isLoading ||
      totalClients.isLoading ||
      totalTasks.isLoading ||
      totalActivityLogs.isLoading,
    error:
      totalEmployees.error ||
      totalClients.error ||
      totalTasks.error ||
      totalActivityLogs.error,
  };
};
