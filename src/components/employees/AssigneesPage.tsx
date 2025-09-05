import { useMemo } from "react";
import { useGetTasks } from "../../api/useTask";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  User,
  Building2,
  Users,
  FileText,
  Mail,
  IdCard,
  Briefcase,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AssignedTo {
  assignedClients: string[];
  assignedTasks: string[];
  createdAt: string;
  documentImageId: string;
  documentType: string;
  isActive: boolean;
  panNumber: string;
  position: string;
  status: string;
  updatedAt: string;
  user: User;
  __v: number;
  _id: string;
}

interface Client {
  clientNature: string;
  companyName: string;
  registrationNumber: string;
  _id: string;
}

interface Task {
  assignedTo: AssignedTo | AssignedTo[];
  client: Client;
  createdAt: string;
  description: string;
  dueDate: string;
  employee: string;
  status: string;
  subTasks: string[];
  taskTitle: string;
  updatedAt: string;
  __v: number;
  _id: string;
}

interface TaskResponse {
  filter: {
    clientId: null;
    employeeId: null;
    status: null;
  };
  message: string;
  success: boolean;
  tasks: Task[];
  totalTasks: number;
}

const EmployeeClientDashboard = () => {
  const { data: taskData } = useGetTasks() as {
    data: TaskResponse | undefined;
  };
  // Process the data to group by employees and their clients
  const processedData = useMemo(() => {
    if (!taskData?.tasks)
      return { employees: [], totalClients: 0, totalEmployees: 0 };

    const employeeMap = new Map();

    taskData.tasks.forEach((task) => {
      const assignees = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : [task.assignedTo];

      assignees.forEach((employee: AssignedTo) => {
        const employeeId = employee._id;

        if (!employeeMap.has(employeeId)) {
          employeeMap.set(employeeId, {
            employee: employee,
            clients: new Map(),
            totalTasks: employee.assignedTasks?.length ?? 0,
          });
        }

        const employeeData = employeeMap.get(employeeId);
        const clientId = task.client._id;

        if (!employeeData.clients.has(clientId)) {
          employeeData.clients.set(clientId, task.client);
        }
      });
    });

    // Convert to array and calculate totals
    const employees = Array.from(employeeMap.values()).map((emp) => ({
      ...emp,
      clients: Array.from(emp.clients.values()),
      clientCount: emp.clients.size,
    }));

    const totalClients = new Set(taskData.tasks.map((task) => task.client._id))
      .size;
    const totalEmployees = employees.length;

    return { employees, totalClients, totalEmployees };
  }, [taskData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!taskData?.tasks) {
    return (
      <div className="px-4 py-4 md:px-8 lg:px-16">
        <div className="text-xl md:text-2xl font-bold">
          Employee Client Assignments
        </div>
        <div className="mt-4 text-gray-500">No data found or loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:px-8 lg:px-16 h-full overflow-y-auto">
      <div className="text-xl md:text-2xl font-bold mb-6">
        Employee Client Assignments
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {processedData.totalEmployees}
              </p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Building2 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{processedData.totalClients}</p>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{taskData.totalTasks}</p>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {processedData.employees.map((employeeData, employeeIndex) => (
          <Card
            key={employeeData.employee?._id ?? `employee-${employeeIndex}`}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {employeeData.employee?.user?.fullName ?? "Unknown"}
                </CardTitle>
                <Badge
                  className={`${
                    employeeData.employee.isActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  } flex items-center gap-1`}
                >
                  {employeeData.employee.isActive ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {employeeData.employee.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription className="text-gray-600">
                Managing {employeeData.clientCount} client
                {employeeData.clientCount !== 1 ? "s" : ""} with{" "}
                {employeeData.totalTasks} total tasks
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Employee Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-gray-600" />
                  Employee Details
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-gray-900 break-all">
                      {employeeData.employee?.user?.email ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 font-medium">Position:</span>
                    <span className="text-gray-900">
                      {employeeData.employee.position}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IdCard className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 font-medium">PAN:</span>
                    <span className="text-gray-900 font-mono">
                      {employeeData.employee.panNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 font-medium">Document:</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {employeeData.employee.documentType}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Assigned Clients */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Assigned Clients ({employeeData.clientCount})
                </h4>
                <div className="space-y-3">
                  {employeeData.clients.map(
                    (client: Client, clientIndex: number) => (
                      <div
                        key={client?._id ?? `client-${clientIndex}`}
                        className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm"
                      >
                        <h5 className="font-semibold text-gray-900 text-sm mb-2">
                          {client.companyName}
                        </h5>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Registration:</span>
                            <span className="font-mono">
                              {client.registrationNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Client ID:</span>
                            <span className="font-mono text-gray-500">
                              {client._id}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 border-t pt-3">
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{formatDate(employeeData.employee.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize">
                      {employeeData.employee.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{formatDate(employeeData.employee.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeClientDashboard;
