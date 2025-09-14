import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { type Notification } from '../../types/notification';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface NotificationDropdownProps {
  maxNotifications?: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  maxNotifications = 10,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    // loadMoreNotifications,
    // hasMore,
    isLoading
  } = useNotifications();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if(!isOpen) return;
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isOpen, fetchNotifications]);

  const formatNotificationDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return isNaN(dateObj.getTime())
        ? 'Just now'
        : formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (!notification.relatedEntity || !notification.relatedEntityModel) return '#';

    const entityId = notification.relatedEntity._id || notification.relatedEntity.id;
    if (!entityId) return '#';

    switch (notification.relatedEntityModel) {
      case 'Task':
        // Handle task note notifications with specific routing and note highlighting
        if (notification.type === 'task_note_added' && notification.metadata?.taskId) {
          const noteId = notification.metadata.noteId;
          if (user?.role === 'admin') {
            return noteId 
              ? `/assignment/task/${notification.metadata.taskId}?highlightNote=${noteId}`
              : `/assignment/task/${notification.metadata.taskId}`;
          }
          if (user?.role === 'employee') {
            return noteId 
              ? `/employee/task/${notification.metadata.taskId}?highlightNote=${noteId}`
              : `/employee/task/${notification.metadata.taskId}`;
          }
          console.log('task note link', noteId);
        }
        
        // Default task routing for other task notifications
        if (user?.role === 'admin') {
          return '/assignment';
        }
        if (user?.role === 'employee') {
          return `/employee/assigned-tasks/${user?._id}`;
        }
        break;
      case 'Document':
        return '/documents';
      case 'Client':
        return '/clients';
      default:
        return '#';
    }

    return '#';
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      const notificationId = notification._id || notification.id;
      if (notificationId && !notification.isRead) {
        await markAsRead(notificationId);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const displayedNotifications = (notifications || []).slice(0, maxNotifications);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent/50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {(unreadCount || 0) > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              aria-label={`${unreadCount} unread notifications`}
            >
              {(unreadCount || 0) > 99 ? '99+' : (unreadCount || 0)}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-[500px]"
        align="end"
        onCloseAutoFocus={(e: any) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h3 className="font-medium text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {(unreadCount || 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs hover:underline h-6 px-2"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {/* Notifications List */}
        <div className="max-h-[400px]">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {isLoading ? 'Loading notifications...' : 'No notifications'}
            </div>
          ) : (
            <div className="space-y-1">
              {displayedNotifications.map((notification, index) => (
                <div key={notification._id || notification.id || index}>
                  <DropdownMenuItem
                    className={`p-0 cursor-pointer ${!notification.isRead ? 'bg-accent/30' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Link
                      to={getNotificationLink(notification)}
                      className="w-full px-3 py-2 block"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </span>
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {notification.message}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start">
                              <p>{notification.message}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  {index < displayedNotifications.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
            </div>
          )}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};