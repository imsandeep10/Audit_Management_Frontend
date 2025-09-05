import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "./userService";
import { toast } from "sonner";

export const useGetUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await userService.getUser();
      return res;
    },
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await userService.getUserById(userId);
      return res;
    },
    enabled: !!userId,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => await userService.deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => await userService.updateAdmin(userId),
    onSuccess: () => {
      toast.success("User updated  successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useGetAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await userService.getAdmins();
      return res;
    },
  });
};
