// API Response Types
export interface ApiResponse {
    id?: string;
    _id?: string;
    success: boolean;
    message?: string;
    clientId?: string;
    roomId?: string;
}

// Client Creation Response
export interface ClientCreationResponse {
    success: boolean;
    message?: string;
    user?: {
        _id: string;
        fullName: string;
        email: string;
        role: string;
    };
    client?: {
        _id: string;
        companyName: string;
        registrationNumber: number;
    };
}

// Validation Error Types
export interface ValidationError {
    field: string;
    message: string;
    value: string | number | boolean | null;
    location: string;
}

export interface ServerErrorResponse {
    success: boolean;
    message: string;
    count?: number;
    errors?: ValidationError[];
    summary?: Record<string, string[]>;
}

// Task Response Types
export interface TaskResponse {
    success: boolean;
    task: Task;
    message?: string;
}

export interface TasksListResponse {
    success: boolean;
    tasks: Task[];
    message?: string;
}

// Task Types
export interface Task {
    _id: string;
    taskTitle: string;
    taskType?: string; // Added to support conditional UI logic
    description: string;
    status: string;
    assignedTo: Array<{
        _id: string;
        user?: {
            _id: string;
            fullName: string;
            email: string;
        };
        fullName?: string;
        email?: string;
        position?: string;
    }>;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    client: {
        _id: string;
        companyName: string;
        registrationNumber?: number;
        clientNature?: string;
    };
    employee: {
        _id: string;
        user?: {
            _id: string;
            fullName: string;
            email: string;
        };
        fullName?: string;
        email?: string;
        position?: string;
    };
    subTasks: Array<{
        _id: string;
        taskTitle: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    }>;
    __v: number;
}

// Employee Types
export interface Employee {
    _id: string;
    user?: {
        _id: string;
        fullName: string;
        email: string;
    };
    fullName?: string;
    email?: string;
    position?: string;
    isActive?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Employee Response Types
export interface EmployeeResponse {
    success: boolean;
    employee: Employee;
    message?: string;
}

export interface EmployeesListResponse {
    success: boolean;
    employees: Employee[];
    message?: string;
}

// User Types
export interface User {
    _id: string;
    DOB: string;
    address: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    profileImageId: string | null;
    role: "admin" | "client" | "employee";
}

// User Response Types
export interface UserResponse {
    success: boolean;
    user: User;
    message?: string;
}

export interface UsersListResponse {
    success: boolean;
    users: User[];
    message?: string;
}

// Document Types
export interface Document {
    id: string;
    _id?: string;
    filename: string;
    originalName: string;
    url?: string;
    documentURL?: string;
    documentType: string;
    size?: number;
    fileSize?: number;
    mimetype: string;
    description?: string;
    uploadDate: string;
    uploadDateFormatted?: string;
    fiscalYear?: string;
    status?: string;
    uploadedBy: {
        id?: string;
        _id?: string;
        name?: string;
        fullName?: string;
        email?: string;
        role?: string;
    } | null;
}

// Document Response Types
export interface DocumentResponse {
    success: boolean;
    document: Document;
    message?: string;
}

export interface DocumentsListResponse {
    success: boolean;
    documents: Document[];
    message?: string;
}

// Generic API Error
export interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
}
