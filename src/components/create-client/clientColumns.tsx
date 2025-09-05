import { Link, useNavigate } from "react-router-dom";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, Trash2, User, FileUp, Receipt } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../ui/tooltip";
import type { Client } from "../../lib/types";
import { DeletePopup } from "../DeletePopup";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const createClientColumns = (
  deleteUser: (id: string) => void,
  navigate: ReturnType<typeof useNavigate>
): ColumnDef<Client>[] => {
  return [
    {
      accessorKey: "companyName",
      header: "Company Name",
      size: 200,
      cell: ({ row }: { row: Row<Client> }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Avatar className="rounded-lg">
                <AvatarImage
                  src={client?.user?.profileImageId?.url}
                  alt="Image"
                  className="object-cover"
                />
                <AvatarFallback>
                  {client?.user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="font-medium text-gray-900">
              {client.companyName || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.user?.fullName,
      header: "Client Name",
      size: 160,
      cell: ({ row }: { row: Row<Client> }) => {
        const client = row.original;
        const fullName = client.user?.fullName;

        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">
              {fullName || "N/A"}
            </span>
          </div>
        );
      },
    },

    {
      accessorFn: (row) => row.clientNature,
      header: "Client Nature",
      size: 160,
      cell: ({ row }: { row: Row<Client> }) => {
        const client = row.original;
        const clientNature = client.clientNature;

        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">
              {clientNature || "N/A"}
            </span>
          </div>
        );
      },
    },

    {
      accessorFn: (row) => row.user?.phoneNumber,
      header: "Phone",
      size: 140,
      cell: ({ row }: { row: Row<Client> }) => {
        const client = row.original;
        const phone = client.user?.phoneNumber;

        return (
          <span className="text-sm text-gray-700 font-mono">
            {phone || "N/A"}
          </span>
        );
      },
    },
    {
      accessorKey: "assignedEmployees",
      header: "Assigned Employees",
      size: 140,
      cell: ({ row }: { row: Row<Client> }) => {
        const client = row.original;
        const employeeCount = client.assignedEmployees?.length || 0;

        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700 font-medium">
              {employeeCount} {employeeCount === 1 ? "employee" : "employees"}
            </span>
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "Actions",
      size: 160,
      cell: ({ row }: { row: Row<Client> }) => {
        const client = row.original;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1.5">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium transition-all duration-200"
                    onClick={() => {
                      navigate(`/user-detail/${client.user?._id}`, {
                        state: {
                          userId: client.user?._id,
                          clientId: client._id,
                          userName: client.user?.fullName || client.companyName,
                          userType: "client",
                        },
                      });
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-center text-white text-xs px-3 py-2 rounded shadow-lg border-0 w-40"
                >
                  View details for {client.companyName}
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all duration-200"
                  >
                    <Link to={`/clients/${client._id}`}>
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg border-0"
                  sideOffset={5}
                >
                  <p>Edit {client.companyName}'s information</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <DeletePopup
                    title="Remove Client"
                    description="Are you sure you want to remove this client?"
                    onConfirm={() => deleteUser(client.user?._id || "")}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                        onClick={() => {
                          // Handle delete action
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg border-0"
                  sideOffset={5}
                >
                  <p>Remove {client.companyName} from system</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-400 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      navigate(`/upload-client-documents/${client._id}`, {
                        state: {
                          clientId: client._id,
                          clientName:
                            client.user?.fullName || client.companyName,
                        },
                      });
                    }}
                  >
                    <FileUp className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs px-4 py-1 rounded shadow-lg border-0"
                  sideOffset={5}
                >
                  <p>
                    Upload {client.companyName} <br /> documents to system
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-400 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      navigate(`/clients/${client._id}/upload-client-bills`, {
                        state: {
                          clientId: client._id,
                          clientName:
                            client.user?.fullName || client.companyName,
                        },
                      });
                    }}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs px-4 py-1 rounded shadow-lg border-0"
                  sideOffset={5}
                >
                  <p>
                    Upload Sales and Purchase bills for {client.companyName}{" "}
                    <br /> to system
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];
};
