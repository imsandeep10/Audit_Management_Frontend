import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EmployeeTaskService } from "../../api/employeeTaskService";
import type { Client, EmployeeResponse } from "../../types/employees";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

export const AssignedClientDetails = () => {
  const { user } = useAuth();
  const employeeId = user?.employee?._id;
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<EmployeeResponse>({
    queryFn: async () => {
      if (!employeeId) throw new Error("No employee ID");
      return await EmployeeTaskService.getEmployeeData(employeeId);
    },
    enabled: !!employeeId,
    queryKey: ["employee", employeeId],
    placeholderData: keepPreviousData,
  });

  // Toggle row expansion - only one row can be expanded at a time
  const toggleRowExpansion = (clientId: string) => {
    setExpandedRow(expandedRow === clientId ? null : clientId);
  };

  // Extract clients from the nested structure
  const clients = data?.employee?.assignedClients || [];

  if (isError) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p>
          Error loading client data:{" "}
          {(error as Error)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto max-w-7xl p-4">
      
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {clients.length === 0 && !isLoading 
                ? "No clients assigned to this employee" 
                : "List of clients assigned to you. Click on a row to view full details."}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Tax Information</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-4 w-[80px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[140px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[160px]" />
                        <Skeleton className="h-4 w-[120px]" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-10 w-[120px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Actual data
                clients.map((client: Client) => {
                  const isExpanded = expandedRow === client._id;
                  
                  return (
                    <>
                      <TableRow 
                        key={client._id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRowExpansion(client._id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar>
                              {client.profileImageId?.url ? (
                                <AvatarImage
                                  src={client.profileImageId.url}
                                  alt={client.fullName}
                                />
                              ) : null}
                              <AvatarFallback>
                                {client.fullName?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{client.companyName}</p>
                              <p className="text-sm text-muted-foreground">{client.fullName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{client.email}</p>
                            <p className="text-sm">{client.phoneNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">IRD:</span> {client.IRDID || "N/A"}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Type:</span> {client.clientType || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employee/clients/${client._id}/documents`, {
                                state: {
                                  clientId: client._id,
                                  clientName: client.fullName,
                                  userType: "employee",
                                  companyName: client.companyName,
                                },
                              });
                            }}
                          >
                            View Documents
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {isExpanded && (
                        <TableRow key={`${client._id}-details`}>
                          <TableCell colSpan={5}>
                            <div className="p-4 bg-muted/30 rounded-lg">
                              <h4 className="font-semibold mb-3">Complete Client Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <p><span className="font-medium">Full Name:</span> {client.fullName}</p>
                                  <p><span className="font-medium">Email:</span> {client.email}</p>
                                  <p><span className="font-medium">Phone:</span> {client.phoneNumber}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><span className="font-medium">IRD ID:</span> {client.IRDID || "N/A"}</p>
                                  <p><span className="font-medium">IRD Office:</span> {client.IRDoffice || "N/A"}</p>
                                  <p><span className="font-medium">IRD Password:</span> {client.irdPassword || "N/A"}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><span className="font-medium">Client Nature:</span> {client.clientNature || "N/A"}</p>
                                  <p><span className="font-medium">Client Type:</span> {client.clientType || "N/A"}</p>
                                  <p><span className="font-medium">Registered Under:</span> {client.registeredUnder || "N/A"}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><span className="font-medium">Date of Tax Registration:</span> {client.dateOfTaxRegistration ? new Date(client.dateOfTaxRegistration).toLocaleDateString() : "N/A"}</p>
                                  <p><span className="font-medium">Date of VAT Registration:</span> {client.dateOfVatRegistration ? new Date(client.dateOfVatRegistration).toLocaleDateString() : "N/A"}</p>
                                </div>
                                <div className="space-y-2">
                                  <p><span className="font-medium">Filling Period:</span> {client.fillingperiod || "N/A"}</p>
                                  <p><span className="font-medium">Index File Number:</span> {client.indexFileNumber || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};