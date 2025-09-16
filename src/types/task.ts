export type TaskFormData = {
  taskTitle: string;
  description: string;
  status: string;
  assignedTo: string[];
  clientId: string;
  dueDate: string;
  subTasks: { title: string }[];
};

export type TaskSubmitData = {
  _id?: string;
  taskTitle: string;
  description: string;
  status: string;
  assignedTo: string[];
  clientId?: string;
  dueDate: string;
  subTasks: { taskTitle: string; status: 'todo' | 'in-progress' | 'completed' | 'cancelled' }[];
  type?: string;
  period?: 'Monthly' | 'Trimester' | 'ITR' | 'Estimated Return';
};

export interface ClientDetails {
  _id: string;
  user?: string;
  companyName: string;
  email?: string;
  registrationNumber?: string;
  IRDID?: string;
  OCRID?: string;
  VCTSID?: string;
  clientNature?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeDetails {
  _id: string;
  user?: string;
  fullName: string;
  email?: string;
  position?: string;
  panNumber?: string;
  address?: string;
  phoneNumber?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubTask {
  _id?: string | undefined;
  taskTitle: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskWithDetails {
  _id: string;
  taskTitle: string;
  description: string;
  dueDate: Date;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: Array<EmployeeDetails | string>;
  employee: EmployeeDetails | string;
  client: ClientDetails | string;
  subTasks: SubTask[];
  createdAt?: Date;
  updatedAt?: Date;
}


export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}