import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const useGlobalSearch = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Debounce the search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const searchQuery = useQuery({
    queryKey: ["globalSearch", debouncedTerm],
    queryFn: async () => {
      if (!debouncedTerm.trim()) return null;
      const res = await axiosInstance.get(`/search/?q=${debouncedTerm}`);
      return res.data.data;
    },
    enabled: !!debouncedTerm.trim(), // Only enable when there's a search term
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (cache time)
  });

  // Function to manually invalidate and refetch search results
  const refreshSearchResults = () => {
    queryClient.invalidateQueries({ 
      queryKey: ["globalSearch", debouncedTerm],
      exact: true 
    });
  };

  // Function to clear search cache completely
  const clearSearchCache = () => {
    queryClient.removeQueries({ queryKey: ["globalSearch"] });
    setSearchTerm("");
    setDebouncedTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    refreshSearchResults,
    clearSearchCache,
    ...searchQuery,
  };
};