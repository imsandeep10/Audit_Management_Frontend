import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Users, Filter, X } from "lucide-react";
import { Button } from "../ui/button";
import { createClientColumns } from "./clientColumns";
import type { Client } from "../../lib/types";
import { useDeleteUser } from "../../api/useUser";
import { ClientDataTable } from "./client-data-table";
import { BulkClientUpload } from "./ClientsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState, useEffect } from "react";
import { clientService } from "../../api/clientService";

export default function ClientPage() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "0");
  const navigate = useNavigate();
  const { mutate: deleteUser } = useDeleteUser();

  // Filter states
  const [filters, setFilters] = useState({
    clientNature: undefined,
    irdOffice: undefined,
    fillingPeriod: undefined,
    registerUnder: undefined,
    clientType: undefined,
  });
  
  // Data states
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalClients: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filterOptions, setFilterOptions] = useState({
    clientNatures: [],
    irdOffices: [],
    fillingPeriods: [],
    registerUnders: [],
    clientTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const columns = createClientColumns(deleteUser, navigate);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setIsLoadingFilters(true);
        const response = await clientService.getFilterOptions();
        setFilterOptions(response.filterOptions);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch clients based on filters and pagination
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if any filters are active
        const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');
        
        let response;
        if (hasActiveFilters) {
          // Use filter endpoint if filters are active
          const filterParams = {
            ...filters,
            page: currentPage,
            limit: 5,
          };
          response = await clientService.filterClients(filterParams);
        } else {
          // Use regular endpoint if no filters
          response = await clientService.getClients(currentPage, 5);
        }
        
        setClients(response.clients || []);
        setPagination(response.pagination || {});
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [filters, currentPage]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    if (currentPage !== 0) {
      navigate("?page=0");
    }
  };

  const handleRefresh = () => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');
        
        let response;
        if (hasActiveFilters) {
          const filterParams = {
            ...filters,
            page: currentPage,
            limit: 5,
          };
          response = await clientService.filterClients(filterParams);
        } else {
          response = await clientService.getClients(currentPage, 5);
        }
        
        setClients(response.clients || []);
        setPagination(response.pagination || {});
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  };

  // Handle successful bulk upload
  const handleBulkUploadSuccess = () => {
    handleRefresh();
  };

  return (
    <div className="h-screen overflow-y-auto bg-white p-5 pb-20">
      <div className="flex justify-between items-center py-8 px-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Client Details
          </h1>
          {!isLoading && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {pagination.totalClients || 0}{" "}
                {pagination.totalClients === 1 ? "client" : "clients"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 order-1 sm:order-2">
            {/* Individual client add */}
            <Link to="/addclients">
              <Button className="gap-2 bg-[#210EAB] px-4 py-2 hover:bg-[#210EAB]/90 text-white">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </Link>

            {/* Bulk client upload */}
            <BulkClientUpload onSuccess={handleBulkUploadSuccess} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-4 px-5">
        {isLoading ? (
          <div className="min-h-screen bg-gray-50">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-2">
                Error loading clients
              </div>
              <div className="text-gray-500 text-sm mb-4">
                {error.message || "Something went wrong"}
              </div>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : pagination.totalClients === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4 text-center">
              <Users className="h-12 w-12 text-gray-300" />
              <div className="text-gray-500 text-lg font-medium">
                No clients found
              </div>
              <div className="text-gray-400 text-sm max-w-md">
                Get started by adding your first client to the system.
              </div>
              <div className="flex gap-2">
                <Link to="/addclients">
                  <Button className="gap-2 bg-[#210EAB] px-4 py-2 hover:bg-[#210EAB]/90 text-white">
                    <Plus className="h-4 w-4" />
                    Add Single Client
                  </Button>
                </Link>
                <BulkClientUpload
                  onSuccess={handleBulkUploadSuccess}
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Bulk Clients
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Controls */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filter Clients</span>
                </div>
                {Object.values(filters).some(value => value) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFiltersChange({})}
                    className="gap-2 text-xs"
                    disabled={isLoadingFilters}
                  >
                    <X className="h-3 w-3" />
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Client Nature Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Client Nature</label>
                  <Select
                    value={filters.clientNature || 'all'}
                    onValueChange={(value) => handleFiltersChange({
                      ...filters,
                      clientNature: value === 'all' ? undefined : value,
                    })}
                    disabled={isLoadingFilters}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Natures" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Natures</SelectItem>
                      {filterOptions.clientNatures.map((nature: string) => (
                        <SelectItem key={nature} value={nature}>
                          {nature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* IRD Office Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">IRD Office</label>
                  <Select
                    value={filters.irdOffice || 'all'}
                    onValueChange={(value) => handleFiltersChange({
                      ...filters,
                      irdOffice: value === 'all' ? undefined : value,
                    })}
                    disabled={isLoadingFilters}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Offices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Offices</SelectItem>
                      {filterOptions.irdOffices.map((office: string) => (
                        <SelectItem key={office} value={office}>
                          {office}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filling Period Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Filling Period</label>
                  <Select
                    value={filters.fillingPeriod || 'all'}
                    onValueChange={(value) => handleFiltersChange({
                      ...filters,
                      fillingPeriod: value === 'all' ? undefined : value,
                    })}
                    disabled={isLoadingFilters}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Periods</SelectItem>
                      {filterOptions.fillingPeriods.map((period: string) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Register Under Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Register Under</label>
                  <Select
                    value={filters.registerUnder || 'all'}
                    onValueChange={(value) => handleFiltersChange({
                      ...filters,
                      registerUnder: value === 'all' ? undefined : value,
                    })}
                    disabled={isLoadingFilters}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Registers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Registers</SelectItem>
                      {filterOptions.registerUnders.map((register: string) => (
                        <SelectItem key={register} value={register}>
                          {register.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Type Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Client Type</label>
                  <Select
                    value={filters.clientType || 'all'}
                    onValueChange={(value) => handleFiltersChange({
                      ...filters,
                      clientType: value === 'all' ? undefined : value,
                    })}
                    disabled={isLoadingFilters}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {filterOptions.clientTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <ClientDataTable<Client, unknown>
              columns={columns}
              data={clients || []}
              totalPages={pagination.totalPages || 0}
              totalItems={pagination.totalClients || 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
