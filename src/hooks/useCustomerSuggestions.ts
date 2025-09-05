import { useQuery } from "@tanstack/react-query";
import { getCustomerSuggestions, type CustomerSuggestion } from "../api/BillsService";

export const useCustomerSuggestions = (clientId: string) => {
  return useQuery<CustomerSuggestion[]>({
    queryKey: ["customerSuggestions", clientId],
    queryFn: () => getCustomerSuggestions(clientId),
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};