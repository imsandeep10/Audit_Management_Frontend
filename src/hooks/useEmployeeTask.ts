import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmployeeTaskService } from "../api/employeeTaskService";
import { type TaskWithDetails } from "../types/task";
import { toast } from "sonner";

export const useEmployeeTasks = (employeeId: string) => {

  return useQuery<TaskWithDetails[], Error>({
    queryKey: ["employeeTasks", employeeId],
    queryFn: () => EmployeeTaskService.getTaskByEmployeeId(employeeId),
    enabled: !!employeeId,
  });



};


export const useUpdateSubTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, subTaskId, status }: { taskId: string; subTaskId?: string, status: string }) =>
      subTaskId
        ? EmployeeTaskService.updateSubTaskStatus(taskId, subTaskId, status)
        : EmployeeTaskService.updateTaskStatus(taskId, status),
    onSuccess: (data: any) => {
      toast.success("Status updated successfully", { id: data.id });
      queryClient.invalidateQueries({ queryKey: ["employeeTasks"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};


export const useAddSubTaskNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, subTaskId, note }: { taskId: string; subTaskId: string; note: string }) =>
      EmployeeTaskService.addSubTaskNote(taskId, subTaskId, note),
    onSuccess: (data: any) => {
      toast.success("Note added successfully", { id: data.id });
      queryClient.invalidateQueries({ queryKey: ["employeeTasks"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};
