import { useQuery } from "@tanstack/react-query";
import { reportService } from "../api/reportService";

interface ITRReportData {
  _id: string;
  taskTitle: string;
  description: string;
  clientName: string;
  companyName: string;
  registrationNumber: string;
  clientNature: string;
  taxableAmount: number;
  taxAmount: number;
  taskAmount: number;
  assignedEmployee: string;
  completedDate: string;
  dueDate: string;
}

interface ITRReportResponse {
  success: boolean;
  fiscalYear: string;
  data: ITRReportData[];
  totals: {
    totalTaxableAmount: number;
    totalTaxAmount: number;
    totalTaskAmount: number;
    totalTasks: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface EstimatedReturnReportData {
  _id: string;
  taskTitle: string;
  description: string;
  clientName: string;
  companyName: string;
  registrationNumber: string;
  clientNature: string;
  estimatedRevenue: number;
  netProfit: number;
  assignedEmployee: string;
  completedDate: string;
  dueDate: string;
}

interface EstimatedReturnReportResponse {
  success: boolean;
  fiscalYear: string;
  data: EstimatedReturnReportData[];
  totals: {
    totalEstimatedRevenue: number;
    totalNetProfit: number;
    totalTasks: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Custom hook for ITR Report
export const useITRReport = (fiscalYear: string) => {
  return useQuery<ITRReportResponse, Error>({
    queryKey: ["itrReport", fiscalYear],
    queryFn: async () => {
      const response = await reportService.getITRReport(fiscalYear);
      return response.data;
    },
    enabled: !!fiscalYear,
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Custom hook for Estimated Return Report
export const useEstimatedReturnReport = (fiscalYear: string) => {
  return useQuery<EstimatedReturnReportResponse, Error>({
    queryKey: ["estimatedReturnReport", fiscalYear],
    queryFn: async () => {
      const response = await reportService.getEstimatedReturnReport(fiscalYear);
      return response.data;
    },
    enabled: !!fiscalYear,
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Export types for use in components
export type { ITRReportData, ITRReportResponse, EstimatedReturnReportData, EstimatedReturnReportResponse };