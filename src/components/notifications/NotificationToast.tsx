import { toast } from 'sonner';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

type NotificationType = 'task_created' | 'task_assigned' | 'task_completed' | 'task_updated' | 'document_uploaded' | 'system_alert';

interface NotificationToastProps {
  type: NotificationType;
  title: string;
  message: string;
  onClick?: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'task_completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'system_alert':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'task_assigned':
    case 'task_created':
      return <Bell className="h-4 w-4 text-blue-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

export const showNotificationToast = ({ type, title, message, onClick }: NotificationToastProps) => {
  const icon = getNotificationIcon(type);
  
  toast.custom(
    (t: any) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
        onClick={() => {
          if (onClick) onClick();
          toast.dismiss(t);
        }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  );
};