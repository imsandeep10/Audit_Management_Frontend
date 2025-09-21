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

  // Function to get top 5 employees (already sorted by backend)
  const getTopEmployees = (data: EmployeeProgress[] | undefined) => {
    if (!data) return [];
    
    // Backend already returns top 5 employees sorted by progress
    return data.slice(0, 5);
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
          <div className="flex flex-col gap-4 pt-3">
            {topEmployees.map((employee) => (
              <div key={employee.employeeId} className="flex flex-col">
                <div className="flex flex-row justify-between text-lg mb-1">
                  <span className="font-semibold">{employee.employeeName}</span>
                  <span>{employee.overallProgress}%</span>
                </div>
                <div className="text-[#484747] mb-2">
                  <p className="text-sm">
                    Progress: {employee.completedTasks}/{employee.totalTasks} tasks completed
                  </p>
                  {employee.remainingTasks > 0 && (
                    <p className="text-xs text-gray-500">
                      {employee.remainingTasks} tasks remaining
                    </p>
                  )}
                </div>
                <div className="pt-1">
                  <Progress value={employee.overallProgress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentProgress;