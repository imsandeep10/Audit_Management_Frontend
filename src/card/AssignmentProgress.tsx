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
        // Safely handle clients array - provide fallback for undefined/null
        const clients = employee.clients || [];
        
        // Calculate average progress across all clients for this employee
        const avgProgress = clients.length > 0
          ? clients.reduce((sum, client) => sum + client.progressPercentage, 0)
          : 0;
        
        return {
          ...employee,
          clients, // Use the safe clients array
          avgProgress
        };
      })
      .filter(employee => employee.clients && employee.clients.length > 0) // Only show employees with clients
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
        <h3 className="text-2xl font-semibold">Assignment Progress</h3>
        {topEmployees.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No assignment data available</p>
          </div>
        ) : (
          topEmployees.map((employee) => {
            // Safely get the first client or show a fallback
            const firstClient = employee.clients && employee.clients.length > 0 ? employee.clients[0] : null;
            
            if (!firstClient) {
              return (
                <div className="flex flex-col gap-3 pt-3" key={employee.employeeId}>
                  <div className="flex flex-col">
                    <div className="flex flex-row justify-between text-lg">
                      <span className="font-semibold">{employee.employeeName}</span>
                      <span>0%</span>
                    </div>
                    <div className="text-[#484747]">
                      <p className="text-sm">No tasks assigned</p>
                    </div>
                    <div className="pt-2">
                      <Progress value={0} />
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="flex flex-col gap-3 pt-3" key={`${employee.employeeId}-${firstClient.clientId}`}>
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between text-lg">
                    <span className="font-semibold">{employee.employeeName}</span>
                    <span>{firstClient.progressPercentage}%</span>
                  </div>
                  <div className="text-[#484747]">
                    <p className="text-lg">Client: {firstClient.clientName}</p>
                    <p className="text-sm">
                      Progress: {firstClient.completedTasks}/{firstClient.totalTasks} tasks completed
                    </p>
                  </div>
                  <div className="pt-2">
                    <Progress value={firstClient.progressPercentage} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentProgress;