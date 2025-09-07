import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import type { Employee } from "../../lib/types";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Button } from "../../components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../../components/ui/command";
import { useCreateTask, useUpdateTask } from "../../api/useTask";
import { useGetAllEmployees } from "../../api/useEmployee";
import type { TaskSubmitData } from "../../types/task";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import DatePicker from "../../components/date picker/date-picker";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../hooks/useAuth";

// Define types
export interface Client {
  _id: string;
  user?: {
    fullName?: string;
  };
  companyName?: string;
  fillingperiod?: string;
}

export interface EmployeeUser {
  employee?: {
    _id: string;
    assignedClients: Client[];
    assignedTasks: any[];
    user: string;
    position: string;
    status: string;
    isActive: boolean;
    panNumber: string;
    documentType: string;
    documentImageId: {
      _id: string;
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  fullName?: string;
  email?: string;
  role?: string;
  _id: string;
}

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

  const selectedEmployees = employees.filter((employee: Employee) =>
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
              {employees.map((employee: Employee) => {
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
                      className={`mr-2 h-3 w-3 ${
                        isSelected ? "opacity-100" : "opacity-0"
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

const formSchema = z.object({
  taskTitle: z.string().min(1, { message: "Task Title is required." }).trim(),
  status: z.string().nonempty({ message: "Status is required" }),
  dueDate: z.string().nonempty({ message: "Due date is required." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .trim(),
  clientId: z.string().min(1, { message: "Client selection is required." }),
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

export interface AddNewEmployeeTaskProps {
  onClose?: () => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  taskId?: string;
  defaultValues?: {
    taskTitle: string;
    description: string;
    status: string;
    assignedTo: string[] | [];
    clientId: string;
    dueDate: string;
    subTasks: { title: string }[];
  };
}

export function AddNewEmployeeTask({
  onClose,
  onSuccess,
  mode = "create",
  taskId,
  defaultValues,
}: AddNewEmployeeTaskProps) {
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
    clientId: string;
    assignedTo: string[];
    subTasks: { title: string }[];
  };

  const getDefaultValues = (): FormValues => {
    return defaultValues
      ? {
          taskTitle: defaultValues.taskTitle,
          description: defaultValues.description,
          status: defaultValues.status,
          dueDate: defaultValues.dueDate,
          clientId: defaultValues.clientId,
          assignedTo: normalizeAssignedTo(defaultValues.assignedTo),
          subTasks: defaultValues.subTasks ?? [{ title: "" }],
        }
      : {
          taskTitle: "",
          description: "",
          status: "",
          clientId: "",
          assignedTo: [],
          dueDate: "",
          subTasks: [{ title: "" }],
        };
  };

  const processedDefaultValues = getDefaultValues();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: processedDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subTasks",
  });

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { data: employeesResponse } = useGetAllEmployees();
  const { user } = useAuth();

  // Filter employees to show only current user
  const allEmployees = employeesResponse?.data?.employees || [];
  const employees = allEmployees.filter((employee: Employee) => employee._id === user?.employee?._id);

  // Get assigned clients from current user - with proper typing
  const assignedClients: Client[] = (user as EmployeeUser)?.employee?.assignedClients || [];

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (defaultValues && mode === "edit") {
      const processedValues = {
        taskTitle: defaultValues.taskTitle,
        description: defaultValues.description,
        status: defaultValues.status,
        dueDate: defaultValues.dueDate,
        clientId: defaultValues.clientId,
        assignedTo: normalizeAssignedTo(defaultValues.assignedTo),
        subTasks: defaultValues.subTasks ?? [{ title: "" }],
      };
      form.reset(processedValues);
    }
  }, [defaultValues, mode, form, normalizeAssignedTo]);

  const onSubmit = (data: FormValues) => {
    
    const transformedData = {
      taskTitle: data.taskTitle,
      status: data.status,
      dueDate: data.dueDate,
      description: data.description,
      clientId: data.clientId,
      assignedTo: data.assignedTo,
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
            if (onSuccess) onSuccess();
            if (onClose) onClose();
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
          if (onSuccess) onSuccess();
          if (onClose) onClose();
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
          <FormField
            control={form.control}
            name="taskTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900">
                  Task Title{" "}
                  <span className="text-sm text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter task title"
                    className="h-9 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs min-h-0" />
              </FormItem>
            )}
          />

          {/* Client select - now showing only assigned clients */}
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900">
                  Client <span className="text-sm text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full text-sm h-9">
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignedClients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.user?.fullName || 'N/A'}
                        {client.companyName ? ` (${client.companyName})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs min-h-0" />
              </FormItem>
            )}
          />

          {/* Status and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900">
                      Due Date <span className="text-sm text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        type="dialog"
                        label=""
                        id="dueDate"
                        value={field.value}
                        onChange={field.onChange}
                        required
                        className=""
                      />
                    </FormControl>
                    <FormMessage className="text-xs min-h-0" />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
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
          </div>

          {/* Assignee Field - now filtered to show only current user */}
          <FormField
            control={form.control}
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

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900">
                  Description <span className="text-sm text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] resize-none text-sm"
                    placeholder="Enter task description..."
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
              ? (mode === "create" ? "Creating..." : "Updating...")
              : (mode === "create" ? "Create Task" : "Update Task")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AddNewEmployeeTask;