import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EmployeeTaskService } from "../../api/employeeTaskService";
import type { Client, EmployeeResponse } from "../../types/employees";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { Label } from "@radix-ui/react-label";

export const AssignedClientDetails = () => {
  const { user } = useAuth();
  const employeeId = user?.employee?._id;
  const navigate = useNavigate();

  // Updated query to match your actual API response structure
  const { data, isLoading, isError, error } = useQuery<EmployeeResponse>({
    queryFn: async () => {
      if (!employeeId) throw new Error("No employee ID");
      return await EmployeeTaskService.getEmployeeData(employeeId);
    },
    enabled: !!employeeId,
    queryKey: ["employee", employeeId],
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

  // Extract clients from the nested structure
  const clients = data?.employee?.assignedClients || [];

  if (clients.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-muted text-center">
        <p>No clients assigned to this employee</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto max-w-7xl p-4">
      <h2 className="text-2xl font-bold tracking-tight">Assigned Clients</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client: Client) => (
          <Card key={client._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
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
                  <Label className="text-sm">Company Name</Label>
                  <CardDescription className="font-bold">{client.companyName}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-5">
                <span className="text-sm font-medium">Name:</span>
                <span>{client.fullName}</span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-sm font-medium text-wrap">Email:</span>
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-sm font-medium">Phone:</span>
                <span>{client.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-sm font-medium">Address:</span>
                <span>{client.address || "N/A"}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigate(`/employee/clients/${client._id}/documents`, {
                    state: {
                      clientId: client._id,
                      clientName: client.fullName,
                      userType: "employee",
                    },
                  });
                }}
              >
                View Documents
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
