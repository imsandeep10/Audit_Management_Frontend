
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
    | 'task_created'
    | 'task_note_added';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  relatedEntity?: any; 
  relatedEntityModel?: string;
  metadata?: {
    taskId?: string;
    taskTitle?: string;
    subtaskId?: string;
    subtaskTitle?: string;
    noteId?: string;
    noteContent?: string;
    authorName?: string;
    messageType?: string;
    clientName?: string;
    action?: string;
    [key: string]: any;
  };
  __v?: number;
};