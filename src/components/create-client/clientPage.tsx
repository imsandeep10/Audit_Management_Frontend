import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Users, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { useGetClients, useGetClientTypes } from "../../api/useclient";
import { createClientColumns } from "./clientColumns";
import type { Client } from "../../lib/types";
import type { ClientTypeOption } from "../../types/clientTypes";
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
import { useState, useMemo } from "react";

export default function ClientPage() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "0");
  const { data, isLoading, error, refetch } = useGetClients(currentPage, 5);
  const { data: clientTypesResponse, isLoading: isLoadingTypes } = useGetClientTypes();
  const navigate = useNavigate();
  const { mutate: deleteUser } = useDeleteUser();
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");

  const columns = createClientColumns(deleteUser, navigate);

  // Client type options from database with "All Types" option
  const CLIENT_TYPE_OPTIONS = useMemo(() => {
    const allOption = { value: "all", label: "All Types" };
    
    if (!clientTypesResponse?.data || isLoadingTypes) {
      return [allOption];
    }
    
    const dynamicOptions = clientTypesResponse.data.map((type: ClientTypeOption) => ({
      value: type.value,
      label: type.label
    }));
    
    return [allOption, ...dynamicOptions];
  }, [clientTypesResponse, isLoadingTypes]);

  // Filter clients based on selected client type
  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    if (clientTypeFilter === "all") return data.clients;
    
    return data.clients.filter((client: Client) => 
      client.clientType === clientTypeFilter
    );
  }, [data?.clients, clientTypeFilter]);

  // Update pagination stats for filtered data
  const filteredStats = useMemo(() => {
    const totalFiltered = filteredClients.length;
    const totalPages = Math.ceil(totalFiltered / 5);
    
    return {
      totalClients: totalFiltered,
      totalPages,
      clients: filteredClients
    };
  }, [filteredClients]);

  const handleRefresh = () => {
    refetch();
  };

  // Handle successful bulk upload
  const handleBulkUploadSuccess = () => {
    refetch(); // Refresh the clients list after successful upload
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
                {filteredStats.totalClients || 0}{" "}
                {filteredStats.totalClients === 1 ? "client" : "clients"}
                {clientTypeFilter !== "all" && (
                  <span className="text-xs text-blue-600 ml-1">
                    ({CLIENT_TYPE_OPTIONS.find(opt => opt.value === clientTypeFilter)?.label})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Client Type Filter */}
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <Filter className="h-4 w-4 text-gray-600" />
            <Select 
              value={clientTypeFilter} 
              onValueChange={setClientTypeFilter}
              disabled={isLoadingTypes}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Filter by type"} />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        ) : filteredStats.totalClients === 0 ? (
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
          <ClientDataTable<Client, unknown>
            columns={columns}
            data={filteredStats.clients || []}
            totalPages={filteredStats.totalPages || 0}
            totalItems={filteredStats.totalClients || 0}
          />
        )}
      </div>
    </div>
  );
}
