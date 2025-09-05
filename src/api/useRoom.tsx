import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  roomService,
  type CreateGroupRequest,
  type CreateGroupResponse,
} from "./roomService";

export const useCreateRoom = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      try {
        const res = await roomService.createRoom({ employeeId });
        navigate(`/chat?roomId=${res.roomId || ""}`);
        return res;
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteRooms"] });
    },
    onError: () => {
      toast.error("Failed to create room");
    },
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateGroupResponse, Error, CreateGroupRequest>({
    mutationFn: (data: CreateGroupRequest) => roomService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteRooms"] });
    },
    onError: () => {
      toast.error("Failed to create group");
    },
  });
};

export const useGetRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomService.getRooms();
      return res.rooms;
    },
  });
};
export const useGetRoomsById = (roomId: string) => {
  return useQuery({
    queryKey: ["room"],
    queryFn: async () => {
      const res = await roomService.getRoomById(roomId);
      return res;
    },
  });
};

// Infinite scrolling rooms
export const useInfiniteRooms = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ["infiniteRooms", limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await roomService.getRoomsPaginated(pageParam, limit);
      return {
        rooms: res.rooms || [],
        nextPage: res.nextPage || null,
        hasMore: res.hasMore || false,
        totalPages: res.totalPages || 1,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReadMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId }: { roomId: string }) => {
      const res = await roomService.markAsRead(roomId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteRooms"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to mark message as read", {
        description: error.message,
      });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomService.deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteRooms"] });
    },
    onError: () => {
      toast.error("Failed to delete room");
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      data,
    }: {
      roomId: string;
      data: CreateGroupRequest;
    }) => roomService.updateGroup(roomId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["infiniteRooms"] });
    },
    onError: () => {
      toast.error("Failed to update group");
    },
  });
};
