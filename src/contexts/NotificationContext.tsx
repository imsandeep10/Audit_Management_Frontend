import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { type Notification } from "../types/notification";
import { toast } from "sonner";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  hasMore: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  // Fetch notifications from API (Fixed: using GET method)
  const { isLoading, error } = useQuery({
    queryKey: ["notifications", currentPage],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          `/notifications/?page=${currentPage}&limit=20`
        );

        
        const { data } = response.data;

        if (currentPage === 1) {
          setNotifications(data.notifications || []);
        } else {
          setNotifications((prev) => [...prev, ...(data.notifications || [])]);
        }

        setUnreadCount(data.unreadCount || 0);
        setHasMore(data.pagination?.hasMore || false);

        return data;
      } catch (error: any) {
        // Don't let notification errors cascade to auth failures
        console.warn("Failed to fetch notifications:", error.message);
        // Return empty data to prevent query from failing
        return {
          notifications: [],
          unreadCount: 0,
          pagination: { hasMore: false }
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Cache for 30 seconds
    retry: false, // Don't retry on failure to prevent cascade
  });

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      const notification = data.data || data;

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Update unread count
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show toast notification
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    };

    const handleNotificationRead = (data: any) => {
      if (data.data?.notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === data.data.notificationId ||
            n.id === data.data.notificationId
              ? { ...n, isRead: true }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    const handleAllNotificationsRead = () => {

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    };

    // Listen to socket events
    socket.on("new_notification", handleNewNotification);
    socket.on("notification_created", handleNewNotification);
    socket.on("notification_read", handleNotificationRead);
    socket.on("all_notifications_read", handleAllNotificationsRead);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification_created", handleNewNotification);
      socket.off("notification_read", handleNotificationRead);
      socket.off("all_notifications_read", handleAllNotificationsRead);
    };
  }, [socket]);

  // Mark a notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id || n.id === id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await axiosInstance.patch(`/notifications/read/${id}`);
      } catch (error) {
        console.error("Error marking notification as read:", error);
        // Revert on error
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.error("Failed to mark notification as read");
      }
    },
    [queryClient]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await axiosInstance.patch("/notifications/read-all");
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.error("Failed to mark all notifications as read");
    }
  }, [queryClient]);

  // Load more notifications (pagination)
  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more notifications:", error);
      toast.error("Failed to load more notifications");
    }
  }, [hasMore, isLoading]);

  // Manual refresh
  const fetchNotifications = useCallback(async () => {
    try {
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to refresh notifications");
    }
  }, [queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        loadMoreNotifications,
        hasMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
