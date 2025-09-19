import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export interface ClientStatsSummary {
  totalDocuments: number;
  totalBills: number;
  totalSalesBills: number;
  totalPurchaseBills: number;
  totalSalesAmount: number;
  totalPurchaseAmount: number;
}

export function useClientStatsSummary(clientId: string) {
  return useQuery<ClientStatsSummary | null>({
    queryKey: ["clientStatsSummary", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const res = await axiosInstance.get(`/files/clients/${clientId}/stats-summary`);
      return res.data?.data || null;
    },
    enabled: !!clientId,
  });
}
