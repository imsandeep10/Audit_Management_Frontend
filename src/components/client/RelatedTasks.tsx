import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FileText,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../api/taskService';
import type { Task as ApiTask } from '../../types/api';

// Extended Task interface for component use
interface Task extends ApiTask {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface RelatedTasksProps {
  clientId: string;
  clientName?: string;
  companyName?: string;
  maxTasks?: number;
  showHeader?: boolean;
  className?: string;
}

// API service function to fetch client tasks
const fetchClientTasks = async (clientId: string): Promise<Task[]> => {
  try {
    const response = await taskService.getTasksByClientId(clientId);
    return response.tasks || [];
  } catch (error) {
    console.error('Failed to fetch client tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'pending':
      return <Calendar className="h-4 w-4 text-yellow-600" />;
    case 'cancelled':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

export const RelatedTasks: React.FC<RelatedTasksProps> = ({
  clientId,
  clientName,
  companyName,
  maxTasks = 5,
  showHeader = true,
  className = ""
}) => {
  const { user } = useAuth();

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['client-tasks', clientId],
    queryFn: () => fetchClientTasks(clientId),
    enabled: !!clientId,
  });

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const isOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date() && tasks?.find(t => t._id)?.status !== 'completed';
  };

  const getTaskLink = (taskId: string): string => {
    // Always redirect to assignment page with highlight parameter
    return `/assignment?highlightTask=${taskId}`;
  };

  const displayedTasks = tasks?.slice(0, maxTasks) || [];

  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Related Tasks
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Related Tasks
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load tasks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Related Tasks
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No tasks found for this client
            </p>
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                asChild
              >
                <Link to="/assignment">
                  Create Task
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Related Tasks
              <Badge variant="secondary" className="ml-2">
                {tasks.length}
              </Badge>
            </CardTitle>
            {tasks.length > maxTasks && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/assignment">
                  View All
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            )}
          </div>
          {(clientName || companyName) && (
            <p className="text-sm text-muted-foreground">
              Tasks for {companyName && `${companyName} - `}{clientName}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {displayedTasks.map((task) => (
            <div
              key={task._id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon status={task.status} />
                    <Link
                      to={getTaskLink(task._id)}
                      className="font-medium text-sm hover:underline truncate"
                    >
                      {task.taskTitle}
                    </Link>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </Badge>
                    {task.priority && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    )}
                    {isOverdue(task.dueDate) && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {formatDate(task.dueDate)}
                      </span>
                      {task.subTasks && task.subTasks.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {task.subTasks.filter((s: any) => s.status === 'completed').length}/{task.subTasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned employees */}
                {task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {task.assignedTo.length} assigned
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      {task.assignedTo.slice(0, 3).map((assignee) => {
                        const userName = assignee.user?.fullName || assignee.fullName || 'Unknown';
                        return (
                          <TooltipProvider key={assignee._id}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Avatar className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={undefined} />
                                  <AvatarFallback className="text-xs">
                                    {userName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{userName}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                      {task.assignedTo.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{task.assignedTo.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedTasks;