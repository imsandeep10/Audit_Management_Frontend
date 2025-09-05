
export type NotificationRecipient = string | {
  _id: string;
  fullName: string;
  email: string;
  role: string;
};



export type Notification = {
  _id: string; 
  id?: string;
  recipient: NotificationRecipient[];
  sender?: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  type: 
    | 'login' 
    | 'logout' 
    | 'task_assigned' 
    | 'task_completed' 
    | 'task_updated' 
    | 'document_uploaded' 
    | 'message_received' 
    | 'system_alert'
    | 'task_created';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  relatedEntity?: any; 
  relatedEntityModel?: string;
  __v?: number;
};