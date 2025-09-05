import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { DashboardService } from "../api/dashboardService";
import {type  EmployeeProgress } from "../types/dashboard";

const AssignmentProgress = () => {
  const { data: progressData, isLoading, isError } = useQuery<EmployeeProgress[]>({
    queryKey: ['employeeProgress'],
    queryFn: DashboardService.getEmployeeProgress
  });

  // Function to get top 5 employees with highest average progress
  const getTopEmployees = (data: EmployeeProgress[] | undefined) => {
    if (!data) return [];
    
    return data
      .map(employee => {
        // Calculate average progress across all clients for this employee
        const avgProgress = employee.clients.length > 0
          ? employee.clients.reduce((sum, client) => sum + client.progressPercentage, 0)
          : 0;
        
        return {
          ...employee,
          avgProgress
        };
      })
      .sort((a, b) => b.avgProgress - a.avgProgress) 
      .slice(0, 5); 
  };

  const topEmployees = getTopEmployees(progressData);

  if (isLoading) {
    return (
      <Card className="card-custom">
        <CardContent>
          <h3 className="text-2xl font-semibold">Assignment Progress</h3>
          <div className="flex flex-col gap-4 pt-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-2 bg-gray-200 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="card-custom">
        <CardContent>
          <h3 className="text-2xl font-semibold">Assignment Progress</h3>
          <p className="text-red-500">Error loading progress data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-custom">
      <CardContent>
        <h3 className="text-2xl font-semibold"> Assignment Progress</h3>
        {topEmployees.map((employee) => (
          employee.clients.slice(0, 1).map((client) => ( // Only show first client for each employee
            <div className="flex flex-col gap-3 pt-3" key={`${employee.employeeId}-${client.clientId}`}>
              <div className="flex flex-col">
                <div className="flex flex-row justify-between text-lg">
                  <span className="font-semibold">{employee.employeeName}</span>
                  <span>{client.progressPercentage}%</span>
                </div>
                <div className="text-[#484747]">
                  <p className="text-lg">Client: {client.clientName}</p>
                  <p className="text-sm">
                    Progress: {client.completedTasks}/{client.totalTasks} tasks completed
                  </p>
                </div>
                <div className="pt-2">
                  <Progress value={client.progressPercentage} />
                </div>
              </div>
            </div>
          ))
        ))}
      </CardContent>
    </Card>
  );
};

export default AssignmentProgress;