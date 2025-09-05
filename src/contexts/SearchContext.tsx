

import { createContext, useContext, type ReactNode } from "react";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

const SearchContext = createContext<ReturnType<typeof useGlobalSearch> | null>(null);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const search = useGlobalSearch();
  return (
    <SearchContext.Provider value={search}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};
