import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "./taskService";
import type { TaskSubmitData } from "../types/task";
import { toast } from "sonner";

// Helper function to format client eligibility errors
const formatClientEligibilityError = (errorData: any): string => {
  let message = errorData.message || "Some clients are not eligible for this task type";
  
  if (errorData.ineligibleClients && errorData.ineligibleClients.length > 0) {
    const clientInfo = errorData.ineligibleClients
      .map((client: any) => {
        const period = client.currentPeriod || 'no period set';
        return `• ${client.name} (currently: ${period})`;
      })
      .join('\n');
    
    message += `\n\nIneligible clients:\n${clientInfo}`;
    message += '\n\nPlease either:\n• Select different clients that match the period type\n• Change the task period type\n• Update client filling periods in client management';
  }
  
  return message;
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskSubmitData) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error: any) => {
      // Extract error message from backend response
      let errorMessage = "Failed to create task";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
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
    onError: (error: any) => {
      // Extract error message from backend response
      let errorMessage = "Failed to create task";
      
      if (error?.response?.data) {
        errorMessage = formatClientEligibilityError(error.response.data);
      }
      
      toast.error(errorMessage, {
        duration: 8000, // Show longer for detailed error messages
        style: {
          whiteSpace: 'pre-line', // Allow line breaks in toast
        },
      });
    },
  });
};
export const useCreateMaskebari = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskSubmitData) => taskService.createMaskebari(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Bulk tasks created successfully");
    },
    onError: (error: any) => {
      // Extract error message from backend response
      let errorMessage = "Failed to create bulk tasks";
      
      if (error?.response?.data) {
        errorMessage = formatClientEligibilityError(error.response.data);
      }
      
      toast.error(errorMessage, {
        duration: 10000, // Show longer for detailed error messages
        style: {
          whiteSpace: 'pre-line', // Allow line breaks in toast
        },
      });
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
    onError: (error: any) => {
      // Extract error message from backend response
      let errorMessage = "Failed to update task";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
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

export const useUpdateITREstimatedData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      taskId, 
      data 
    }: { 
      taskId: string; 
      data: {
        fiscalYear?: string;
        taxableAmount?: number;
        taxAmount?: number;
        taskAmount?: number;
        estimatedRevenue?: number;
        netProfit?: number;
      } 
    }) => taskService.updateTaskWithITREstimatedData(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task completed successfully");
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update task";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    },
  });
};
