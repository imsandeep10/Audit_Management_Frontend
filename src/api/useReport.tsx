import { useQuery } from "@tanstack/react-query";
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
