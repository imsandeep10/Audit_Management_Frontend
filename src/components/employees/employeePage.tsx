import { createColumns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useGetEmployee } from "../../api/useEmployee";
import { useCreateRoom } from "../../api/useRoom";
import { useDeleteUser } from "../../api/useUser";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

export default function EmployeePage() {
  const { data: response, isLoading, error } = useGetEmployee();
  const { mutate: createRoom } = useCreateRoom();
  const { mutate: deleteUser } = useDeleteUser();
  const navigate = useNavigate();

  const data = response?.data?.employees || [];
  const totalPages = response?.data?.pagination?.totalPages || 0;
  const totalEmployees = response?.data?.pagination?.totalEmployees || 0;

  const columns = createColumns(createRoom, navigate, deleteUser);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-between items-center mt-6 px-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 mt-6">
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>

            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">
          Error loading employees: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mt-6 px-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Employee Details
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalEmployees} total employees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="h-10 bg-[#210EAB] px-4 py-3 hover:bg-[#210EAB]/90 hover:text-white text-white"
          >
            <Link to="/createEmployees" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6">
        <DataTable columns={columns} data={data} totalPages={totalPages} />
      </div>
    </div>
  );
}
