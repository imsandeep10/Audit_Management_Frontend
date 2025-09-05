// ...existing code...

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Calendar, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
// ...existing code...

interface Task {
  _id?: string;
  taskTitle?: string;
  taskType?: string;
  description?: string;
  dueDate?: string;
  status?: string;
  createdAt?: string;
}

interface TasksTableProps {
  tasks?: Task[];
}

const TasksTable: React.FC<TasksTableProps> = ({ tasks = [] }) => {
  // Helper function to format date




  // Helper function to get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!tasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assigned Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tasks assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Assigned Tasks
          </div>
          <Badge variant="secondary">{tasks.length} Tasks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task: Task, index: number) => (
              <TableRow key={task._id || index}>
                <TableCell className="font-medium">
                  {task.taskTitle || "Untitled Task"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {task.taskType ? task.taskType.toUpperCase() : "Normal"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {task.description || (
                    <span className="text-muted-foreground">No description</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate ? task.dueDate.split('T')[0] : ''}
                  </div>
                </TableCell>
                <TableCell>
                  {task.status ? (
                    <Badge
                      variant={getStatusVariant(task.status)}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getStatusIcon(task.status)}
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <AlertCircle className="w-3 h-3" />
                      UNKNOWN
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.createdAt ? task.createdAt.split('T')[0] : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TasksTable;