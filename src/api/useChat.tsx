import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { messageService } from "./messageService";

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      roomId,
    }: {
      content: string;
      roomId: string;
    }) => {
      const res = await messageService.sendMessage({
        content,
        roomId,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCounts"] });
      queryClient.invalidateQueries({ queryKey: ["room"] });
    },
    onError: (error) => {
      toast.error("Failed to send message", {
        description: (error as Error).message,
      });
    },
  });
};

export const useGetMessages = (
  roomId: string | null,
  skip: number = 0,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ["messages", roomId, skip, limit],
    queryFn: async () => {
      if (!roomId) return [];
      const res = await messageService.getMessages(roomId, skip, limit);
      return res.messages;
    },
    enabled: !!roomId,
  });
};

export const useInfiniteMessages = (
  roomId: string | null,
  limit: number = 20
) => {
  return useInfiniteQuery({
    queryKey: ["messages", roomId, limit],
    initialPageParam: 0 as number,
    queryFn: async ({ pageParam }) => {
      if (!roomId) return [] as unknown[];
      const res = await messageService.getMessages(
        roomId,
        pageParam as number,
        limit
      );
      return res.messages as unknown[];
    },
    getNextPageParam: (lastPage, allPages) => {
      const lastCount = (lastPage as unknown[]).length;
      if (lastCount < limit) return undefined; // no more pages
      return allPages.length * limit; // next skip
    },
    enabled: !!roomId,
  });
};
