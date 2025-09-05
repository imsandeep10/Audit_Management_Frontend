import { CircleEllipsis, Menu } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import type { TaskCardProps } from "../types/clientTypes";
import AssignmentMenu from "../components/AssignentMenu";

// Extended type to include client information in assignedTo
type ExtendedAssignee = {
  _id: string;
  user?: { _id: string; fullName: string; email: string };
  fullName?: string;
  email?: string;
  position?: string;
  assignedClients?: string[] | ClientInfo[];
};

type ClientInfo = {
  _id: string;
  companyName: string;
  // Add other client properties as needed
};

interface ExtendedTaskCardProps extends Omit<TaskCardProps, 'assignedTo' | 'client'> {
  assignedTo: ExtendedAssignee[];
  client?: ClientInfo | ClientInfo[]; // Can be single client or array of clients
  clients?: ClientInfo[]; // Array of all available clients for lookup
  taskType?: string;
}

export const TaskCard = ({
  _id,
  taskTitle,
  client,
  description,
  status,
  dueDate,
  assignedTo,
  color = "bg-blue-500",
  progress = 0,
  total = 1,
  avatars = [],
  taskType,
}: ExtendedTaskCardProps) => {
 

  const getProgressPercentage = (): number => {
    return total > 0 ? Math.round((progress / total) * 100) : 0;
  };

  const getStatusColor = (taskStatus: string): string => {
    const statusColors: Record<string, string> = {
      pending: "text-yellow-600",
      "in-progress": "text-blue-600",
      completed: "text-green-600",
      overdue: "text-red-600",
    };
    return statusColors[taskStatus.toLowerCase()] || "text-gray-600";
  };

  const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getTaskClients = (): ClientInfo[] => {
    if (!client) return [];

    if (Array.isArray(client)) {
      return client;
    }

    if (typeof client === 'object' && client._id) {
      return [client];
    }

    return [];
  };

  const getAllClientNames = (): string[] => {
    const taskClients = getTaskClients();
    return taskClients.map(client => client.companyName);
  };


  const getFormattedClients = (): Array<{id: string, name: string}> => {
    const taskClients = getTaskClients();
    return taskClients.map(client => ({
      id: client._id,
      name: client.companyName
    }));
  };

  const assigneeNames: string[] = Array.isArray(assignedTo)
    ? assignedTo.map((a) => a.user?.fullName || a.fullName || "")
    : [];

  const allClientNames = getAllClientNames();
  const formattedClients = getFormattedClients();
  

  const ClientDisplay = () => {
    if (allClientNames.length === 0) {
      return (
        <p className="text-sm font-medium text-gray-600">
          No clients assigned
        </p>
      );
    }

    if (allClientNames.length === 1) {
      return (
        <p className="text-sm font-medium text-gray-600">
          {allClientNames[0]}
        </p>
      );
    }

    return (
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">
          {allClientNames.length} clients assigned
        </p>
        <div className="flex flex-wrap gap-1">
          {allClientNames.map((clientName, index) => (
            <span
              key={formattedClients[index]?.id || index}
              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs font-medium text-blue-700"
              title={clientName}
            >
              {clientName.length > 15 ? `${clientName.substring(0, 15)}...` : clientName}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="group rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {taskTitle}
          </h3>
          <AssignmentMenu selectedTask={_id}>
            <CircleEllipsis
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-150"
              size={28}
            />
          </AssignmentMenu>
        </div>

        <div className="space-y-1">
          <ClientDisplay />
        </div>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {taskType && (
          <div className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-xs font-medium text-purple-700">
            {taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Menu size={16} className="text-gray-400" />
            <span className="text-gray-500">Status:</span>
            <span
              className={`capitalize font-medium ${getStatusColor(status)}`}
            >
              {status.replace("-", " ")}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {progress}/{total} ({getProgressPercentage()}%)
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Footer with due date and avatars */}
        <div className="flex items-center justify-between pt-1">
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
            Due: {dueDate.split("T")[0]}
          </div>

          {(avatars.length > 0 || assigneeNames.length > 0) && (
            <div className="flex -space-x-2">
              {avatars.length > 0
                ? avatars
                  .slice(0, 4)
                  .map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                      alt={`Team member ${idx + 1}`}
                    />
                  ))
                : assigneeNames.slice(0, 4).map((name, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-700"
                    title={name}
                  >
                    {getInitials(name)}
                  </div>
                ))}
              {(avatars.length > 4 || assigneeNames.length > 4) && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  +{(avatars.length || assigneeNames.length) - 4}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show if this is a maskebari task (assigned to all) */}
        {assigneeNames.length > 5 && allClientNames.length > 5 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-xs font-medium text-green-700">
              Maskebari Task - All employees & clients ({allClientNames.length} clients)
            </span>
          </div>
        )}

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            <p>Clients: {allClientNames.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};