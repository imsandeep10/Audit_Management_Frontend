import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "./employeeService";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import type { EmployeeFormData } from "./apis";
import type { AxiosError } from "axios";

export const useGetEmployee = () => {
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "0");

  return useQuery({
    queryKey: ["employees", page],
    queryFn: () => employeeService.getEmployees(page),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const res = await employeeService.createEmployee(data);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      if (data.success) {
        toast.success(data.message || "Employee created successfully");
      } else {
        toast.error(data.message || "Failed to create employee");
      }
    },
    onError: (error: AxiosError) => {
      toast.error("Failed to create employee", {
        description: error?.message,
      });
    },
  });
};

export const useUpdateEmployee = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const res = await employeeService.updateEmployee(data, id);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      if (data.success) {
        toast.success(data.message || "Employee updated successfully");
      } else {
        toast.error(data.message || "Failed to update employee");
      }
    },
    onError: (error: AxiosError) => {
      toast.error("Failed to update employee", {
        description: error?.message,
      });
    },
  });
};

export const useGetAllEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAllEmployees(),
  });
};

export const useGetEmployeeById = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployeeById(id),
    enabled: !!id,
  });
};
