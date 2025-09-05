

export interface ClientProgress {
  clientId: string;
  clientName: string;
  completedTasks: number;
  totalTasks: number;
  progressPercentage: number;
}

export interface EmployeeProgress {
  employeeId: string;
  employeeName: string;
  clients: ClientProgress[];
}