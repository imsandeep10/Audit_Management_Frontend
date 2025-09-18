import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "./taskService";
import type { TaskSubmitData } from "../types/task";
import { toast } from "sonner";

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskSubmitData) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
};

export const useCreateSingleMaskebariTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskSubmitData) => taskService.createSingleMaskebariTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
};
export const useCreateMaskebari = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskSubmitData) => taskService.createMaskebari(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskSubmitData }) =>
      taskService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });
};

export const useGetTasks = (status?: string) => {
  return useQuery({
    queryKey: ["tasks", status],
    queryFn: () => taskService.getTasks(status),
  });
};
export const useGetTaskById = (id?: string) => {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
