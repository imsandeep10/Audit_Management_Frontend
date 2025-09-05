import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import type { Employee } from "../../lib/types";
import { DeletePopup } from "../DeletePopup";

export const createColumns = (
  createRoom: (employeeId: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  deleteUser: (id: string) => void
): ColumnDef<Employee>[] => {
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "user.fullName",
      header: "Name",
      size: 160,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.user?.fullName || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "user?.email",
      header: "Email",
      size: 160,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.user?.email || "N/A"}
        </span>
      ),
    },

    {
      accessorKey: "clients",
      header: "Assigned Clients",
      size: 180,
      cell: ({ row }) => {
        const clients = row.original.assignedClients;
        return (
          <span className="text-gray-900">
            {clients?.length
              ? clients.length + " clients assigned"
              : "No clients assigned"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 160,
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/user-detail/${employee.user._id}`, {
                        state: {
                          userName: employee.user.fullName,
                        },
                      })
                    }
                    className="h-8 px-3"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View details</TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    <Link to={`/updateEmployees/${employee._id}`}>
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg border-0"
                  sideOffset={5}
                >
                  <p>Edit {employee.user?.fullName || "User"}'s information</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DeletePopup
                    title="Remove Employee"
                    description="Are you sure you want to remove this employee?"
                    onConfirm={() => deleteUser(employee.user._id)}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </TooltipTrigger>
                <TooltipContent>Remove employee</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={!employee.user?._id}
                    onClick={() =>
                      employee.user?._id && createRoom(employee.user._id)
                    }
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start chat</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
    {
      id: "activity",
      header: "Activity Logs",
      cell: ({ row }) => {
        const employee = row.original;
        return employee.user?._id ? (
          <Button
            onClick={() =>
              navigate(`/employee-activities/${employee.user._id}`, {
                state: {
                  employeeId: employee.user._id,
                  employeeName: employee.user.fullName,
                },
              })
            }
            variant="outline"
            size="sm"
            className="h-8 px-3"
          >
            View Activities
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-8 px-3" disabled>
            View Activities
          </Button>
        );
      },
    },
  ];

  return columns;
};
