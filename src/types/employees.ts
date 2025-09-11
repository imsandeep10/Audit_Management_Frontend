export type Inputs = {
  fullName: string;
  position: string;
  assignedClients: string;
  status: boolean;
};

export interface DocumentImage {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface User {
  _id: string;
  DOB: string;
  address: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  profileImageId: DocumentImage;
  role: string;
}

export interface AssignedTask {
  _id: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  title?: string; 
  clientId?: string;
}

export interface Client {
  _id: string;
  companyName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  status?: string;
  profileImageId?: DocumentImage;
  assignedTasks?: AssignedTask[];
  // Extended fields for card display
  IRDID?: string;
  IRDoffice?: string;
  bills?: any[];
  clientNature?: string;
  clientType?: string;
  createdAt?: string;
  dateOfTaxRegistration?: string;
  dateOfVatRegistration?: string;
  fillingperiod?: string;
  indexFileNumber?: string;
  irdPassword?: string;
  maskebari?: string | null;
  profileImage?: string | null;
  registeredUnder?: string;
  updatedAt?: string;
  userAddress?: string;
}

export interface Employee {
  _id: string;
  assignedClients: Client[];
  assignedTasks: AssignedTask[];
  createdAt: string;
  documentImageId: DocumentImage;
  documentType: string;
  isActive: boolean;
  panNumber: number;
  position: string;
  status: string;
  updatedAt: string;
  user: User;
  __v: number;
}

export interface EmployeeResponse {
  message: string;
  employee: Employee;
}