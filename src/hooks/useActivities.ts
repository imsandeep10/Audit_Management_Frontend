import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { type Activity } from "../types/activity";
import { useSocket } from "../contexts/SocketContext";
import { activityApiService } from "../api/activityApi";

export const useEmployeeActivities = (
  employeeId: string,
  period: string = "today",
  page: number = 1,
  limit: number = 10
) => {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const fetchActivities = useCallback(async (): Promise<{
    activities: Activity[];
    pagination: {
      total: number;
      totalPages: number;
      page: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> => {
    const response = await activityApiService.getEmployeeActivities(employeeId, period, page, limit);
    
    const activities = response.data?.docs || [];
    const pagination = response.data?.pagination || {
      total: response.data?.totalDocs || 0,
      totalPages: response.data?.totalPages || 1,
      page: response.data?.page || 1,
      hasNextPage: response.data?.hasNextPage || false,
      hasPrevPage: response.data?.hasPrevPage || false
    };

    return {
      activities: activities.map((activity: Activity) => ({
        ...activity,
        userId: activity.userId || {
          _id: 'unknown',
          fullName: 'Unknown User',
          email: 'unknown@example.com',
          role: 'unknown'
        }
      })),
      pagination
    };
  }, [employeeId, period, page, limit]);


  const query = useQuery({
    queryKey: ["employeeActivities", employeeId, period, page, limit],
    queryFn: fetchActivities,
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    placeholderData: () => {
      const previousData = queryClient.getQueryData<{
        activities: Activity[];
        pagination: any;
      }>(["employeeActivities", employeeId, period, page, limit]);
      return previousData || { activities: [], pagination: null };
    }
  });

  useEffect(() => {
    if (!socket || !isConnected || !employeeId) return;

    const handleNewActivity = (activity: Activity) => {
      if (activity.userId._id === employeeId) {
        queryClient.setQueryData<{
          activities: Activity[];
          pagination: any;
        }>(
          ["employeeActivities", employeeId, period, page, limit],
          (old) => {
            if (!old) return { activities: [activity], pagination: null };
            // Check for duplicates before adding
            const exists = old.activities.some(
              existingActivity => existingActivity._id === activity._id
            );
            if (exists) return old;
            return {
              activities: [activity, ...old.activities.slice(0, limit - 1)],
              pagination: old.pagination
            };
          }
        );
      }
    };

    socket.on("new_activity", handleNewActivity);

    return () => {
      socket.off("new_activity", handleNewActivity);
    };
  }, [socket, isConnected, employeeId, period, page, limit, queryClient]);

  return query;
};






export const useAdminActivities = (period: string, page: number = 1, limit: number = 10) => {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const fetchActivities = useCallback(async () => {
    const response = await activityApiService.getAdminDashboardActivities(period, page, limit);
    const responseData = response.data.docs.map((activity: Activity) => ({
      ...activity,
      userId: activity.userId || {
        _id: 'unknown',
        fullName: 'Unknown User',
        email: 'unknown@example.com',
        role: 'unknown'
      }
    }));
    return {
      activities: responseData,
      pagination: {
        total: response.data.totalDocs,
        page: response.data.page,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPrevPage: response.data.hasPrevPage
      }
    };
  }, [period, page, limit]);

  const query = useQuery({
    queryKey: ["admin-activities", period, page, limit],
    queryFn: fetchActivities,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData
  });

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewActivity = (activity: Activity) => {
      queryClient.setQueryData(
        ["admin-activities", period, page, limit],
        (old: any) => {
          if (!old) return old;
          // Check for duplicates
          if (old.activities.some((a: Activity) => a._id === activity._id)) return old;
          return {
            ...old,
            activities: [activity, ...old.activities.slice(0, limit - 1)]
          };
        }
      );
    };

    socket.on("new_activity", handleNewActivity);
    return () => {
      socket.off("new_activity", handleNewActivity);
    };
  }, [socket, isConnected, period, page, limit, queryClient]);

  return {
    ...query,
    data: query.data || { activities: [], pagination: null },
  };
};