import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronDown, Eye, Pencil, Trash2, MessageCircle } from "lucide-react";

// UI Components
import DatePicker from "../components/date picker/date-picker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// API Hooks
import {
  useCreateMaskebari,
  useCreateTask,
  useUpdateTask,
  useGetTaskById,
} from "../api/useTask";
import { useGetAllClients } from "../api/useclient";
import { useGetAllEmployees } from "../api/useEmployee";
import { useMutation } from "@tanstack/react-query";

// Types
import type { TaskSubmitData } from "../types/task";
import type { Employee } from "../lib/types";
import type { Client } from "../types/clientTypes";
import { taskService } from "../api/taskService";
import type { Task } from "../types/api";
import NoteConversationDialog from "./notes/NoteConversationDialog";
import { useAuth } from "../contexts/AuthContext";
import AmountDialog from "../employee/dashboard/AmountDialog";
import ITREstimatedDialog, {
  type TaskWithITRData,
} from "../employee/dashboard/ITREstimatedDialog";

// Client Select Component
function ClientSelect({
  value,
  onValueChange,
  clients,
}: {
  value: string;
  onValueChange: (value: string) => void;
  clients: Client[];
}) {
  const [open, setOpen] = useState(false);

  const selectedClient = clients.find((client) => client._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 text-sm justify-between w-full font-light"
        >
          {selectedClient
            ? selectedClient.user?.fullName || selectedClient.companyName || "N/A"
            : "Select client..."}
          <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search clients..."
            className="h-8 text-sm"
          />
          <CommandEmpty className="text-xs py-2">No client found.</CommandEmpty>
          <CommandGroup>
            <div
              className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{
                scrollBehavior: "smooth",
                overscrollBehavior: "contain",
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {clients.map((client) => (
                <CommandItem
                  key={client._id}
                  value={client.user?.fullName || client.companyName || client._id}
                  keywords={[
                    client.user?.fullName || "",
                    client.companyName || "",
                    client._id,
                  ]}
                  onSelect={() => {
                    onValueChange(client._id);
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer hover:bg-gray-100"
                >
                  <Check
                    className={`mr-2 h-3 w-3 ${value === client._id ? "opacity-100" : "opacity-0"
                      }`}
                  />
                  {client.user?.fullName || client.companyName || "N/A"}
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Assignee Select Component
function AssigneeSelect({
  value,
  onValueChange,
  employees,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  employees: Employee[];
}) {
  const [open, setOpen] = useState(false);

  const selectedEmployees = employees.filter((employee) =>
    value.includes(employee._id)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 text-sm justify-between w-full font-light"
        >
          {selectedEmployees.length > 0
            ? selectedEmployees
              .map((employee) => employee.user?.fullName || "N/A")
              .join(", ")
            : "Select assignees..."}
          <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search employees..."
            className="h-8 text-sm"
          />
          <CommandEmpty className="text-xs py-2">
            No employee found.
          </CommandEmpty>
          <CommandGroup>
            <div
              className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{
                scrollBehavior: "smooth",
                overscrollBehavior: "contain",
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {employees.map((employee) => {
                const isSelected = value.includes(employee._id);
                return (
                  <CommandItem
                    key={employee._id}
                    value={employee.user?.fullName || ""}
                    keywords={[employee.user?.fullName || "", employee._id]}
                    onSelect={() => {
                      const next = isSelected
                        ? value.filter((id) => id !== employee._id)
                        : [...value, employee._id];
                      onValueChange(next);
                    }}
                    className="text-sm cursor-pointer hover:bg-gray-100"
                  >
                    <Check
                      className={`mr-2 h-3 w-3 ${isSelected ? "opacity-100" : "opacity-0"
                        }`}
                    />
                    {employee.user?.fullName || "N/A"}
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Client Multi-Select Component with Enhanced UI
function ClientMultiSelect({
  value,
  onValueChange,
  clients,
  taskType,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  clients: Client[];
  taskType?: string;
}) {
  // Filter clients based on task type
  const filteredClients = useMemo(() => {
    if (!taskType) return clients;
    
    if (taskType === "Monthly" || taskType === "Trimester") {
      return clients.filter(client => client.fillingperiod === taskType);
    }
    
    // ITR and Estimated Return can be assigned to any client
    return clients;
  }, [clients, taskType]);

  const toggleClient = (clientId: string) => {
    const updatedValue = value.includes(clientId)
      ? value.filter(id => id !== clientId)
      : [...value, clientId];
    onValueChange(updatedValue);
  };

  const toggleAll = () => {
    if (value.length === filteredClients.length && filteredClients.length > 0) {
      onValueChange([]);
    } else {
      onValueChange(filteredClients.map(client => client._id));
    }
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          Available clients: {filteredClients.length} | Selected: {value.length}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleAll}
          className="h-7 px-3 text-xs"
        >
          {value.length === filteredClients.length && filteredClients.length > 0 ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Client List */}
      <div className="border rounded-lg max-h-64 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {taskType ? `No clients found with ${taskType} period` : "No clients available"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  value.includes(client._id)
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => toggleClient(client._id)}
              >
                <Checkbox
                  checked={value.includes(client._id)}
                  onCheckedChange={() => toggleClient(client._id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {client.user?.fullName || "No Name"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {client.companyName || "No Company"}
                      </p>
                    </div>
                    <div className="text-right">
                      {client.fillingperiod && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {client.fillingperiod}
                        </span>
                      )}
                    </div>
                  </div>
                  {client.clientNature && (
                    <p className="text-xs text-gray-500 mt-1">
                      Nature: {client.clientNature}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="text-xs text-blue-600">
          {value.length} client{value.length !== 1 ? 's' : ''} selected for bulk task creation
        </div>
      )}
    </div>
  );
}

// Create different schemas based on mode
const createFormSchema = (mode: string) => {
  const baseFields = {
    taskTitle: z.string().min(1, { message: "Task Title is required." }).trim(),
    status: z.string().nonempty({ message: "Status is required" }),
    dueDate: z.string().nonempty({ message: "Due date is required." }),
    description: z
      .string()
      .min(1, { message: "Description is required." })
      .trim(),
  };

  if (mode === "maskebari") {
    return z.object({
      ...baseFields,
      type: z.enum(['Monthly', 'Trimester', 'ITR', 'Estimated Return']),
      selectAllClients: z.boolean().default(false),
      selectedClientIds: z.array(z.string()).optional(),
    });
  }

  return z.object({
    ...baseFields,
    clientId: z.string().nonempty({
      message: "Client must be selected.",
    }),
    assignedTo: z.array(z.string()).min(1, {
      message: "At least one assignee must be selected.",
    }),
    subTasks: z
      .array(
        z.object({
          title: z.string().min(1, "Sub task title is required"),
        })
      )
      .min(0),
  });
};

// Add New Task Component
export function AddNewTask({
  onClose,
  mode,
  taskId,
  defaultValues,
}: {
  onClose?: () => void;
  mode: "create" | "edit" | "maskebari";
  taskId?: string;
  defaultValues?: {
    taskTitle: string;
    description: string;
    status: string;
    assignedTo: string[] | [];
    clientId: string;
    dueDate: string;
    subTasks: { title: string }[];
    type?: "monthly" | "trimester" | "yearly";
  };
}) {
  type AssigneeInput = string | { _id?: string; id?: string };
  const normalizeAssignedTo = useCallback(
    (assignedTo: AssigneeInput[]): string[] => {
      if (!assignedTo || assignedTo.length === 0) return [];

      if (typeof assignedTo[0] === "string") {
        return assignedTo as string[];
      }

      return assignedTo
        .map((item) =>
          typeof item === "string" ? item : item._id || item.id || ""
        )
        .filter((val): val is string => Boolean(val));
    },
    []
  );

  type FormValues = {
    taskTitle: string;
    description: string;
    status: string;
    dueDate: string;
    type?: 'Monthly' | 'Trimester' | 'ITR' | 'Estimated Return';
    selectAllClients?: boolean;
    selectedClientIds?: string[];
    clientId?: string;
    assignedTo?: string[];
    subTasks?: { title: string }[];
  };

  const getDefaultValues = (): FormValues => {
    if (mode === "maskebari") {
      return defaultValues
        ? {
          taskTitle: defaultValues.taskTitle,
          description: defaultValues.description,
          status: defaultValues.status,
          dueDate: defaultValues.dueDate,
          type: (defaultValues.type as 'Monthly' | 'Trimester' | 'ITR' | 'Estimated Return') ?? 'Monthly',
          selectAllClients: false,
          selectedClientIds: [],
        }
        : {
          taskTitle: "",
          description: "",
          status: "",
          dueDate: "",
          type: 'Monthly',
          selectAllClients: false,
          selectedClientIds: [],
        };
    }

    return defaultValues
      ? {
        taskTitle: defaultValues.taskTitle,
        description: defaultValues.description,
        status: defaultValues.status,
        dueDate: defaultValues.dueDate,
        assignedTo: normalizeAssignedTo(defaultValues.assignedTo),
        clientId: defaultValues.clientId,
        subTasks: defaultValues.subTasks ?? [{ title: "" }],
      }
      : {
        taskTitle: "",
        description: "",
        status: "",
        assignedTo: [],
        clientId: "",
        dueDate: "",
        subTasks: [{ title: "" }],
      };
  };

  const processedDefaultValues = getDefaultValues();

  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(mode)) as any,
    defaultValues: processedDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subTasks",
  });

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: createMaskebari, isPending: isCreatingMaskebari } = useCreateMaskebari();
  const { data: clients } = useGetAllClients();
  const { data: employeesResponse } = useGetAllEmployees();
  const employees = employeesResponse?.data?.employees || [];

  const isPending = isCreating || isUpdating || isCreatingMaskebari;

  useEffect(() => {
    if (defaultValues && mode === "edit") {
      const processedValues = {
        taskTitle: defaultValues.taskTitle,
        description: defaultValues.description,
        status: defaultValues.status,
        dueDate: defaultValues.dueDate,
        assignedTo: normalizeAssignedTo(defaultValues.assignedTo),
        clientId: defaultValues.clientId,
        subTasks: defaultValues.subTasks ?? [{ title: "" }],
      };
      form.reset(processedValues);
    } else if (defaultValues && mode === "maskebari") {
      const maskebarValues = {
        taskTitle: defaultValues.taskTitle,
        description: defaultValues.description,
        status: defaultValues.status,
        dueDate: defaultValues.dueDate,
        type: (defaultValues.type as 'Monthly' | 'Trimester' | 'ITR' | 'Estimated Return') ?? "Monthly",
        selectAllClients: false,
        selectedClientIds: [],
      };
      form.reset(maskebarValues);
    }
  }, [defaultValues, mode, form, normalizeAssignedTo]);

  const onSubmit = (data: FormValues) => {

    if (mode === "maskebari") {
      // Validate client selection for maskebari mode
      if (!data.selectAllClients && (!data.selectedClientIds || data.selectedClientIds.length === 0)) {
        // Set form error for client selection
        form.setError("selectedClientIds", { 
          type: "manual", 
          message: "Please select at least one client or check 'Select All Clients'" 
        });
        return;
      }

      const maskebarData: TaskSubmitData = {
        taskTitle: data.taskTitle,
        status: data.status,
        dueDate: data.dueDate,
        description: data.description,
        assignedTo: [],
        subTasks: [],
        type: data.type,
        selectAllClients: data.selectAllClients,
        selectedClientIds: data.selectAllClients ? undefined : data.selectedClientIds,
      };
      createMaskebari(maskebarData, {
        onSuccess: () => {
          form.reset(getDefaultValues());
          if (onClose) {
            onClose();
          }
        },
        onError: (error) => {
          console.error("Failed to create maskebari:", error);
        },
      });
      return;
    }

    const transformedData = {
      taskTitle: data.taskTitle,
      status: data.status,
      dueDate: data.dueDate,
      description: data.description,
      clientId: data.clientId!,
      assignedTo: data.assignedTo!,
      subTasks: (data.subTasks || [])
        .filter((task) => task.title.trim() !== "")
        .map((task) => ({
          taskTitle: task.title,
          status: "todo" as const,
        })),
    };

    if (mode === "edit" && taskId) {
      updateTask(
        { taskId, data: transformedData as TaskSubmitData },
        {
          onSuccess: () => {
            if (onClose) {
              onClose();
            }
          },
          onError: (error: unknown) => {
            console.error("Failed to update task:", error);
          },
        }
      );
    } else {
      createTask(transformedData as TaskSubmitData, {
        onSuccess: () => {
          form.reset(getDefaultValues());
          if (onClose) {
            onClose();
          }
        },
        onError: (error) => {
          console.error("Failed to create task:", error);
        },
      });
    }
  };

  const handleCancel = () => {
    form.reset(getDefaultValues());
    if (onClose) {
      onClose();
    }
  };

  const addSubTask = () => {
    append({ title: "" });
  };

  const removeSubTask = (index: number) => {
    remove(index);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
        <div className="max-h-[60vh] overflow-y-auto space-y-4 hide-scrollbar">
          {/* Maskebari Mode Header */}
          {mode === "maskebari" && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Bulk Task Creation</h3>
                  <p className="text-sm text-blue-700">Create tasks for multiple clients at once</p>
                </div>
              </div>
            </div>
          )}

          <FormField
            control={form.control as any}
            name="taskTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900">
                  {mode === "maskebari" ? "Title" : "Task Title"}{" "}
                  <span className="text-sm text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={
                      mode === "maskebari"
                        ? "Enter title"
                        : "Enter task title"
                    }
                    className="h-9 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs min-h-0" />
              </FormItem>
            )}
          />

          {/* Status and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control as any}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">
                    Status <span className="text-sm text-red-600">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full text-sm h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs min-h-0" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="dueDate"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      Due Date <span className="text-sm text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        label=""
                        id="dueDate"
                        value={field.value}
                        onChange={field.onChange}
                        required
                      />
                    </FormControl>
                    <FormMessage className="text-xs min-h-0" />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* Period Field - Only show for maskebari mode */}
          {mode === "maskebari" && (
            <>
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      Period <span className="text-sm text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full text-sm h-9">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Trimester">Trimester</SelectItem>
                          <SelectItem value="ITR">ITR</SelectItem>
                          <SelectItem value="Estimated Return">Estimated Return</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs min-h-0" />
                  </FormItem>
                )}
              />
              
              {/* Client Selection for Maskebari */}
              <div className="space-y-4 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <div className="text-lg font-semibold text-gray-900">
                  📋 Bulk Task Creation - Client Selection
                </div>
                
                <FormField
                  control={form.control as any}
                  name="selectAllClients"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Select All Eligible Clients
                        </FormLabel>
                        <p className="text-xs text-gray-500">
                          Automatically create tasks for all clients that match the selected period type
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Individual Client Selection - Only show when "Select All" is unchecked */}
                {!form.watch("selectAllClients") && (
                  <FormField
                    control={form.control as any}
                    name="selectedClientIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Choose Specific Clients <span className="text-sm text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <ClientMultiSelect
                            value={field.value || []}
                            onValueChange={field.onChange}
                            clients={clients?.data?.clients || []}
                            taskType={form.watch("type")}
                          />
                        </FormControl>
                        <FormMessage className="text-xs min-h-0" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Show summary when "Select All" is checked */}
                {form.watch("selectAllClients") && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          All eligible clients will be selected automatically
                        </p>
                        <p className="text-xs text-blue-700">
                          {form.watch("type") === "Monthly" || form.watch("type") === "Trimester" 
                            ? `Only clients with "${form.watch("type")}" filling period will be included`
                            : "All active clients will be included (any filling period)"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Only show these fields if NOT in maskebari mode */}
          {mode !== "maskebari" && (
            <>
              {/* Client and Assignee Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        Client <span className="text-sm text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <ClientSelect
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          clients={clients?.data?.clients || []}
                        />
                      </FormControl>
                      <FormMessage className="text-xs min-h-0" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        Assignee <span className="text-sm text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <AssigneeSelect
                          value={Array.isArray(field.value) ? field.value : []}
                          onValueChange={field.onChange}
                          employees={employees}
                        />
                      </FormControl>
                      <FormMessage className="text-xs min-h-0" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sub Tasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-gray-900">
                    Sub Tasks
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubTask}
                    className="h-8 px-3 text-sm"
                    disabled={fields.length >= 5}
                  >
                    + Add
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 hide-scrollbar">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <FormItem className="flex-1">
                        <FormLabel className="sr-only">Sub Task {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={`Sub task ${index + 1}`}
                            className="h-9 text-sm w-full"
                            {...form.register(`subTasks.${index}.title` as const)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs min-h-0" />
                      </FormItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSubTask(index)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
                        title="Remove"
                        disabled={fields.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {fields.length >= 5 && (
                  <p className="text-xs text-red-600">
                    You cannot add more than 5 subtasks
                  </p>
                )}
              </div>
            </>
          )}

          {/* Description */}
          <FormField
            control={form.control as any}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900">
                  Description <span className="text-sm text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] resize-none text-sm"
                    placeholder={
                      mode === "maskebari"
                        ? "Enter description..."
                        : "Enter task description..."
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-9 px-4 text-sm"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-[#210EAB] hover:bg-[#3A2FC4] h-9 px-6 text-sm"
            disabled={isPending}
          >
            {isPending
              ? (mode === "maskebari"
                ? "Creating Maskebari..."
                : mode === "create"
                  ? "Creating..."
                  : "Updating...")
              : (mode === "maskebari"
                ? "Create Maskebari"
                : mode === "create"
                  ? "Create Task"
                  : "Update Task")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Assignment Menu Component
type AssignedToItem = {
  _id: string;
  user?: { _id: string; fullName: string; email: string };
  fullName?: string;
  email?: string;
  position?: string;
};

type Props = {
  selectedTask: string;
  children: React.ReactNode;
};

const AssignmentMenu: React.FC<Props> = ({ selectedTask, children }) => {
  const [dialogState, setDialogState] = useState<
    "view" | "delete" | "edit" | null
  >(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [itrEstimatedDialogOpen, setItrEstimatedDialogOpen] = useState(false);
  const [selectedTaskForITREstimated, setSelectedTaskForITREstimated] = useState<TaskWithITRData | null>(null);
  const [selectedSubTaskForNotes, setSelectedSubTaskForNotes] = useState<{
    subTaskId: string;
    subTaskTitle: string;
  } | null>(null);

  const { data, isLoading, error } = useGetTaskById(selectedTask || undefined);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate: deleteTask } = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTaskById(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDialogState(null);
      toast.success("Task deleted successfully");
    },
    onError: () => {
      toast.error("Error deleting task");
    },
  });

  const handleDelete = () => {
    setDialogState(null);
    if (!selectedTask) return;
    deleteTask(selectedTask);
  };

  // Helper to collect assigned users as an array
  const getAssignedUsersInfo = () => {
    const task = data?.task as Task | undefined;
    if (!task)
      return [] as Array<{
        name: string;
        email: string | null;
        position: string | null;
      }>;

    const assignees: Array<{
      name: string;
      email: string | null;
      position: string | null;
    }> = [];

    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
      for (const a of task.assignedTo as Array<AssignedToItem>) {
        if (a?.user?.fullName) {
          assignees.push({
            name: a.user.fullName,
            email: a.user.email || null,
            position: a.position || null,
          });
          continue;
        }
        if (a?.fullName) {
          assignees.push({
            name: a.fullName,
            email: a.email || null,
            position: a.position || null,
          });
          continue;
        }
        if (a?.position) {
          assignees.push({
            name: `${a.position} (Name not available)`,
            email: null,
            position: a.position,
          });
          continue;
        }
      }
    }

    if (task.employee) {
      if (task.employee.user?.fullName) {
        assignees.push({
          name: task.employee.user.fullName,
          email: task.employee.user.email || null,
          position: task.employee.position || null,
        });
      } else if (task.employee.fullName) {
        assignees.push({
          name: task.employee.fullName,
          email: task.employee.email || null,
          position: task.employee.position || null,
        });
      } else if (task.employee.position) {
        assignees.push({
          name: `${task.employee.position} (Name not available)`,
          email: null,
          position: task.employee.position,
        });
      }
    }

    if (assignees.length === 0) {
      return [{ name: "Not assigned", email: null, position: null }];
    }
    return assignees;
  };

  const assignedUsersInfo = getAssignedUsersInfo();

  const taskForAmountDialog = useMemo(() => {
    const task = data?.task as any;
    if (!task) return null;
    const clients = Array.isArray(task.client)
      ? task.client
      : task.client
        ? [task.client]
        : [];
    return {
      _id: task._id,
      taskTitle: task.taskTitle,
      taskType: task.taskType,
      client: clients.map((c: any) => ({
        _id: c?._id,
        companyName: c?.companyName,
        clientNature: c?.clientNature,
        registrationNumber: c?.registrationNumber,
      })),
    } as any;
  }, [data]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogState("edit")}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogState("view")}>
            <Eye className="mr-2 h-4 w-4" />
            View Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDialogState("delete")}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Task Details Dialog */}
      <Dialog
        open={dialogState === "view"}
        onOpenChange={() => setDialogState(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <span>Title: </span>
              {data?.task?.taskTitle || "Task Details"}
            </DialogTitle>
            <DialogDescription>
              <span>Description: </span>
              {data?.task?.description || "Task information and details"}
            </DialogDescription>
            {/* Edit Amount Button - only show if taskType exists */}
         
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading task
            </div>
          ) : data?.task ? (
            <div className="space-y-4">
              <div className="border p-4 rounded shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p>
                      <strong>Status:</strong>
                      <span className="capitalize"> {data.task.status}</span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Due Date:</strong>
                      {" " + new Date(data.task.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>Created:</strong>
                      {" " + new Date(data.task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Client Details - FIXED: Now properly displays client information */}
                {Array.isArray(data.task.client) && data.task.client.length > 0 && (() => {
                  const client = data.task.client[0];
                  const user = client.user;
                  return (
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <h4 className="font-semibold mb-2">Client Information</h4>
                      {user && (
                        <>
                          <p className="flex items-center gap-2">
                            <strong>Name:</strong> {user.fullName || "N/A"}
                          </p>
                          <p className="flex items-center gap-2">
                            <strong>Email:</strong> {user.email || "N/A"}
                          </p>
                        </>
                      )}
                      <p className="flex items-center gap-2">
                        <strong>Company:</strong> {client.companyName || "N/A"}
                      </p>
                      {client.clientNature && (
                        <p className="flex items-center gap-2">
                          <strong>Nature:</strong> {client.clientNature}
                        </p>
                      )}
                      {client.registrationNumber && (
                        <p className="flex items-center gap-2">
                          <strong>Registration:</strong>{" "}
                          {client.registrationNumber}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Sub Tasks Section */}
                {data.task.subTasks && data.task.subTasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Sub Tasks ({data.task.subTasks.length})
                    </h4>
                    <div className="space-y-3">
                      {data.task.subTasks.map(
                        (subTask: {
                          _id: string;
                          taskTitle: string;
                          status?: string;
                          notes?: Array<{
                            content: string;
                            createdAt: string;
                            createdBy?: {
                              fullName: string;
                              email?: string;
                            };
                          }>;
                        }, index: number) => (
                          <div
                            key={subTask._id}
                            className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50"
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium">
                                <p>{index + 1}. {subTask.taskTitle}</p>
                                {subTask.status && (
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    subTask.status === "completed" 
                                      ? "bg-green-100 text-green-800"
                                      : subTask.status === "in-progress"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {subTask.status}
                                  </span>
                                )}

                                
                              </div>
                              
                              {/* Note conversation button - Hidden for completed subtasks */}
                              {subTask.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="ml-2"
                                  onClick={() => {
                                    setSelectedSubTaskForNotes({
                                      subTaskId: subTask._id,
                                      subTaskTitle: subTask.taskTitle
                                    });
                                    setNoteDialogOpen(true);
                                  }}
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Notes ({subTask.notes?.length || 0})
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Users Details */}
                {(data.task.employee || data.task.assignedTo) && (
                  <div className="mt-4 p-3 bg-green-50 rounded">
                    <h4 className="font-semibold mb-2">Assigned Users</h4>
                    <div className="space-y-1">
                      {assignedUsersInfo.map((u, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="flex items-center gap-2">
                            <strong>Name:</strong> {u.name}
                          </p>
                          {u.email && (
                            <p className="flex items-center gap-2">
                              <strong>Email:</strong> {u.email}
                            </p>
                          )}
                          {u.position && (
                            <p className="flex items-center gap-2">
                              <strong>Position:</strong> {u.position}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>No task found.</p>
          )}

             <div className="flex w-full justify-end gap-2 mt-2">
              {data?.task?.taskType && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                  onClick={() => {
                    const task: any = data?.task;
                    const taskType = task?.taskType?.toLowerCase();
                    // Open ITR/Estimated Return dialog for those types
                    if (taskType === "itr" || taskType === "estimated return") {
                      // Pass the entire task so the dialog can read itrData/estimatedReturnData
                      setSelectedTaskForITREstimated(task as unknown as TaskWithITRData);
                      setItrEstimatedDialogOpen(true);
                      setDialogState(null);
                      return;
                    }
                    // Otherwise fallback to Amount dialog
                    setAmountDialogOpen(true);
                    setDialogState(null);
                  }}
                >
                  Edit Amount
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setDialogState(null)}>Close</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog - FIXED: Now properly passes clientId */}
      <Dialog
        open={dialogState === "edit"}
        onOpenChange={() => setDialogState(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task information below
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">
              Error loading task
            </div>
          ) : data?.task ? (
            <AddNewTask
              mode="edit"
              taskId={selectedTask}
              defaultValues={{
                taskTitle: data.task.taskTitle || "",
                description: data.task.description || "",
                status: data.task.status || "",
                assignedTo: Array.isArray(data.task.assignedTo)
                  ? (data.task.assignedTo as Array<AssignedToItem>)
                    .map((a) => a?._id || "")
                    .filter(Boolean)
                  : data.task.employee?._id
                    ? [data.task.employee._id]
                    : [],
                clientId: Array.isArray(data.task.client)
                  ? (data.task.client[0]?._id || "")
                  : (data.task.client?._id || ""), // This ensures clientId is passed correctly
                dueDate: data.task.dueDate || "",
                subTasks: data.task.subTasks?.map(
                  (subTask: { taskTitle: string }) => ({
                    title: subTask.taskTitle || "",
                  })
                ) || [{ title: "" }],
              }}
              onClose={() => setDialogState(null)}
            />
          ) : (
            <p>No task found.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogState === "delete"}
        onOpenChange={() => setDialogState(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              className="cursor-pointer"
              onClick={() => setDialogState(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleDelete}
              variant="destructive"
            >
              Delete Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Conversation Dialog */}
      {selectedSubTaskForNotes && (
        <NoteConversationDialog
          isOpen={noteDialogOpen}
          onClose={() => {
            setNoteDialogOpen(false);
            setSelectedSubTaskForNotes(null);
          }}
          taskId={selectedTask}
          subTaskId={selectedSubTaskForNotes.subTaskId}
          subTaskTitle={selectedSubTaskForNotes.subTaskTitle}
          currentUserName={user?.fullName || "Admin"}
        />
      )}

      {/* Amount Dialog */}
      {amountDialogOpen && taskForAmountDialog && (
        <AmountDialog
          isOpen={amountDialogOpen}
          onClose={() => setAmountDialogOpen(false)}
          onSave={async () => {
            await queryClient.invalidateQueries({ queryKey: ["tasks"] });
            await queryClient.invalidateQueries({ queryKey: ["task", selectedTask] });
            toast.success("Amounts saved");
          }}
          task={taskForAmountDialog}
        />
      )}

      {/* ITR/Estimated Return Dialog */}
      {selectedTaskForITREstimated && (
        <ITREstimatedDialog
          isOpen={itrEstimatedDialogOpen}
          onClose={() => {
            setItrEstimatedDialogOpen(false);
            setSelectedTaskForITREstimated(null);
          }}
          task={selectedTaskForITREstimated}
        />
      )}
    </>
  );
};

export default AssignmentMenu;