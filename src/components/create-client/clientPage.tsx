import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useGetClients } from "../../api/useclient";
import { createClientColumns } from "./clientColumns";
import type { Client } from "../../lib/types";
import { useDeleteUser } from "../../api/useUser";
import { ClientDataTable } from "./client-data-table";
import { BulkClientUpload } from "./ClientsDialog";

export default function ClientPage() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "0");
  const { data, isLoading, error, refetch } = useGetClients(currentPage, 5);
  const navigate = useNavigate();
  const { mutate: deleteUser } = useDeleteUser();

  const columns = createClientColumns(deleteUser, navigate);

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
                {data?.pagination?.totalClients || 0}{" "}
                {data?.pagination?.totalClients === 1 ? "client" : "clients"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
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
        ) : data?.clients?.length === 0 ? (
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
            data={data?.clients || []}
            totalPages={data?.pagination?.totalPages || 0}
            totalItems={data?.pagination?.totalClients || 0}
          />
        )}
      </div>
    </div>
  );
}
