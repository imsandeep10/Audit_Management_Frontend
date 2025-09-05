

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  DOB: string;
  address: string;
  phone: string;
  profileImageId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  lockUntil: string | null;
  loginAttempts: number;
  refreshToken: string;
  rooms: string[];
  employee: string;
  messages: Message[];
  __v: number;
}


import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

// =====================================================
// Authentication & User Types
// =====================================================
export interface Image {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url?: string;
  description?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface AxiosLikeError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export type userform = {
  fullName: string;
  email: string;
  password: string;
};

export type Employee = {
  _id: string;
  user: {
    _id: string;
    fullName?: string;
    status: string;
    email?: string;
  };
  status: string;
  assignedClients: { _id: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  position: string;
};

// Raw API response interface
export interface RawClientData {
  _id?: string;
  VCTSID?: string;
  IRDID?: string;
  OCRID?: string;
  companyName?: string;
  registrationNumber?: string;
  status?: string;
  assignedEmployees?: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  user?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    DOB?: string;
    role?: string;
    profileImageId?: string | null;
  };
}

export type Client = {
  _id: string;
  VCTSID?: string;
  IRDID?: string;
  OCRID?: string;
  companyName: string;
  registrationNumber?: string;
  clientNature?: string;
  status?: "active" | "inactive";
  assignedEmployees: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    DOB: string;
    role: string;
    profileImageId: Image | null;
  } | null;
};




export interface User {
  _id: string;
  id?: string;
  fullName: string;
  email: string;
  role: string;
  profileImageId?: Image | null;
  phoneNumber?: number;
  address?: string;
  DOB?: string;
  rooms?: Room[];
  employee?: {
    _id: string;
    position?: string;
    panNumber?: string;
    documentType?: string;
    documentImageId?: Image | null;
    assignedClients?: Client[];
  };
}


// =====================================================
// Chat & Communication Types
// =====================================================

export interface Message {
  id: string;
  _id: string;
  content: string;
  sender: string | Participant; // Can be string or Participant object
  createdAt: Date | string; // Accept both Date and string
  isGroup?: boolean;
  roomId?: string; // Add roomId to track which room message belongs to
}

export interface Contact {
  id: string;
  name: string;
  initial: string;
  isOnline: boolean;
  lastMessage?: string;
  lastSeen?: string;
  isGroup?: boolean;
}

export interface Participant {
  _id: string;
  id?: string;
  fullName?: string;
  email: string;
  role?: string;
}

export interface Room {
  _id: string;
  name?: string;
  isGroup: boolean;
  participants: Participant[];
  lastMessage?: {
    content: string;
    sender: string | Participant;
    createdAt: string;
  };
  lastActivity: string;
  unreadCount?: Array<{
    userId: string;
    count: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Profile & Form Types
// =====================================================

export interface UserProfileData {
  name: string;
  title: string;
  location: string;
  avatar: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    website: string;
    address: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  basicInfo: {
    birthday: string;
    gender: string;
  };
  work: {
    primary: {
      company: string;
      address: string;
    };
    secondary: {
      company: string;
      address: string;
    };
  };
}

export interface UserProfileProps {
  profileData?: UserProfileData;
}

export interface FormData {
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  personalInfo: {
    fullName: string;
    address: string;
    bio: string;
  };
}

// =====================================================
// UI & Component Types
// =====================================================

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalPages: number;
}

export interface CardData {
  id: number;
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "employee";
}

export interface HalfCircleGradientProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
}

// =====================================================
// Assignment & Task Types
// =====================================================

export type FilterOption = "default" | "asc" | "desc" | "reverse";

export interface Task {
  _id: string;
  taskTitle: string;
  description: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  client: {
    _id: string;
    companyName: string;
  };
  employee: {
    _id: string;
  };
  __v: number;
  subTasks?: { title: string; status: string }[];
  progress?: number;
  total?: number;
}

export type TaskCardProps = {
  color: string;
  _id: string;
  taskTitle: string;
  description: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  client: {
    _id: string;
    companyName: string;
  };
  employee: {
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
  key?: string;
  project?: string;
  progress?: number;
  total?: number;
  date?: string;
  avatars?: string[];
  subTasks?: { title: string; status: string }[];
};

export type MenuItem = {
  name: string;
  icon: LucideIcon;
  component: React.ReactNode;
};

export interface menuItem {
  title: string;
  url: string;
  icon: ComponentType<object>;
}

export interface menuSection {
  items: menuItem[];
}

// =====================================================
// Auth Form Types (Zod inferred types)
// =====================================================

export interface EmailStepProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

export interface OtpStepProps {
  email: string;
  onSubmit: (otp: string) => void;
  onResendOtp: () => void;
  otpResent?: boolean;
  isLoading?: boolean;
}

export interface PasswordStepProps {
  onSubmit: (password: string) => void;
  isLoading?: boolean;
}

export type props = {
  type: "signin" | "signup";
};
