import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportService } from "./reportService";

export const useGetReportSummary = () => {
  return useQuery({
    queryKey: ["reportSummary"],
    queryFn: async () => {
      const res = await reportService.getReportSummary();
   

      return res;
    },
  });
};

export const useGetMonthlyReport = () => {
  return useQuery({
    queryKey: ["monthlyReport"],
    queryFn: async () => {
      const res = await reportService.getMonthlyReport();
     
      return res;
    },
  });
};

export const useGetMonthlyUserReport = () => {
  return useQuery({
    queryKey: ["monthlyUserReport"],
    queryFn: async () => {
      const res = await reportService.getMonthlyUserReport();
      return res;
    },
  });
};

export const useUpdateITRByTaskId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, itrData }: { taskId: string; itrData: { taxableAmount?: number; taxAmount?: number; taskAmount?: number; } }) => {
      return reportService.updateITRByTaskId(taskId, itrData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useUpdateEstimatedReturnByTaskId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, estimatedReturnData }: { taskId: string; estimatedReturnData: { estimatedRevenue?: number; netProfit?: number; } }) => {
      return reportService.updateEstimatedReturnByTaskId(taskId, estimatedReturnData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};


