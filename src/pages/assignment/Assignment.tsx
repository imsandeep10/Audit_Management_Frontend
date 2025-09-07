import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { LiaSlidersHSolid } from "react-icons/lia";
import { AddNewTask } from "../../card/AddNewtask";
import { useState, type JSX } from "react";
import { TaskCard } from "../../card/TaskCard";
import { useGetTasks } from "../../api/useTask";
import { useGetAllClients } from "../../api/useclient";
import type { FilterOption } from "../../lib/types";
import type { Task } from "../../types/clientTypes";
import {
  ArrowDown,
  ClipboardList,
  MoveUp,
  Plus,
  RotateCcw,
} from "lucide-react";
import { TaskCardSkeleton } from "../../components/TaskCardSekelton";

const Assignment: React.FC = () => {
  const [filterOption, setFilterOption] = useState<FilterOption>("default");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isMaskebarDialogOpen, setIsMaskebarDialogOpen] =
    useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(
    undefined
  );

  const { data: tasksResponse, isLoading } = useGetTasks(currentStatus);
  const tasks = tasksResponse?.tasks || [];
  const { data: clientsResponse } = useGetAllClients();
  const clients = clientsResponse?.data?.clients || []; // Assuming clients are included in the response


  type AssigneeObject = {
    _id: string;
    user?: { _id: string; fullName: string; email: string };
    fullName?: string;
    email?: string;
    position?: string;
    assignedClients?: string[]; // Array of client IDs
    assignedTasks?: string[];
    // Add other assignee properties as needed
  };

  type Assignee = AssigneeObject | string;

  const normalizeAssignedTo = (assignedTo: unknown): AssigneeObject[] => {
    if (!Array.isArray(assignedTo)) return [];
    return (assignedTo as Assignee[]).map((assignee) => {
      if (typeof assignee === "string") {
        return { _id: assignee };
      }
      return {
        ...assignee,
        assignedClients: assignee.assignedClients || [],
      };
    });
  };

  const sortTasks = (tasks: Task[], option: FilterOption): Task[] => {
    switch (option) {
      case "asc":
        return [...tasks].sort((a, b) =>
          (a.taskTitle || "").localeCompare(b.taskTitle || "", undefined, {
            sensitivity: "base",
          })
        );
      case "desc":
        return [...tasks].sort((a, b) =>
          (b.taskTitle || "").localeCompare(a.taskTitle || "", undefined, {
            sensitivity: "base",
          })
        );
      case "reverse":
        return [...tasks]
          .sort((a, b) =>
            (a.taskTitle || "").localeCompare(b.taskTitle || "", undefined, {
              sensitivity: "base",
            })
          )
          .reverse();
      default:
        return tasks;
    }
  };

  const renderTasks = (status: string, color: string): JSX.Element[] => {
    const sortedTasks = getFilteredTasks(status);
    return sortedTasks.map((task: Task) => (
      <TaskCard
        key={task._id}
        {...task}
        assignedTo={normalizeAssignedTo(task.assignedTo as unknown)}
        clients={clients} // Pass clients array for lookup
        color={color}
        progress={
          task.subTasks?.filter((subTask) => subTask.status === "completed")
            .length
        }
        total={task.subTasks?.length}
      />
    ));
  };

  const getFilteredTasks = (status?: string): Task[] => {
    const filteredTasks = status
      ? tasks.filter((task: Task) => task?.status === status)
      : tasks;
    return sortTasks(filteredTasks, filterOption);
  };

  const EmptyState: React.FC<{ message: string; description?: string }> = ({
    message,
    description,
  }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ClipboardList size={30} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      )}
    </div>
  );

  const handleFilterSelect = (option: FilterOption): void => {
    setFilterOption(option);
    setIsFilterOpen(false);
  };

  const handleTabChange = (value: string): void => {
    if (value === "allTask") {
      setCurrentStatus(undefined);
    } else {
      setCurrentStatus(value);
    }
  };

  const handleCloseDialog = (): void => {
    setIsDialogOpen(false);
  };

  const handleCloseMaskebarDialog = (): void => {
    setIsMaskebarDialogOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 h-screen pt-5 pb-10 ">
      <h1 className="text-2xl font-semibold">Assigned Task</h1>
      <Tabs
        defaultValue="allTask"
        className="w-full pt-5"
        onValueChange={handleTabChange}
      >
        <div className="flex flex-col gap-5 items-center  md:flex-row md:justify-between ">
          <TabsList className=" h-[50px] w-full text-md  ">
            <TabsTrigger
              value="allTask"
              className="data-[state=active]:!text-white data-[state=active]:!bg-[#210EAB] text-sm md:text-lg bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="todo"
              className="data-[state=active]:!text-white data-[state=active]:!bg-[#210EAB] text-sm md:text-lg bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Todo
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="data-[state=active]:!text-white data-[state=active]:!bg-[#210EAB] text-sm md:text-lg bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:!text-white data-[state=active]:!bg-[#210EAB] text-sm md:text-lg bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Completed
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-row gap-5 items-center justify-between md:justify-end  w-full  ">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex flex-row items-center  gap-2  rounded-sm  card-custom cursor-pointer py-2 px-4 "
                type="button"
                aria-label="Filter tasks"
                aria-expanded={isFilterOpen}
              >
                <LiaSlidersHSolid />
                <span>Filter</span>
              </button>
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleFilterSelect("asc")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      type="button"
                    >
                      <span className="text-gray-600">
                        <MoveUp size={10} />
                      </span>
                      Asc. (A-Z)
                    </button>
                    <button
                      onClick={() => handleFilterSelect("desc")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      type="button"
                    >
                      <span className="text-gray-600">
                        <ArrowDown size={10} />
                      </span>
                      Desc. (Z-A)
                    </button>
                    <button
                      onClick={() => handleFilterSelect("reverse")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      type="button"
                    >
                      <span className="text-gray-600">
                        <RotateCcw size={10} />
                      </span>
                      Reverse
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => handleFilterSelect("default")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-500"
                      type="button"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              )}
              {isFilterOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterOpen(false)}
                  role="button"
                  tabIndex={-1}
                  aria-label="Close filter dropdown"
                />
              )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger
                className="py-2 px-4 rounded-sm bg-[#210EAB] hover:bg-[#3A2FC4]  text-white cursor-pointer text-sm   flex items-center gap-2 justify-center"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add New Task
              </DialogTrigger>
              <DialogContent className="max-w-full">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold">
                    Add New Task
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Effortly manage your todo list: add a new task
                  </DialogDescription>
                </DialogHeader>
                <AddNewTask onClose={handleCloseDialog} mode="create" />
              </DialogContent>
            </Dialog>

            <Dialog
              open={isMaskebarDialogOpen}
              onOpenChange={setIsMaskebarDialogOpen}
            >
              <DialogTrigger
                className="py-2 px-4 rounded-sm bg-[#210EAB] hover:green-700  text-white cursor-pointer text-sm   flex items-center gap-2 justify-center"
                onClick={() => setIsMaskebarDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Bulk Tasks
              </DialogTrigger>
              <DialogContent className="max-w-full">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold">
                   Add Bulk Tasks
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Create a new Bulk Task with simplified fields
                  </DialogDescription>
                </DialogHeader>
             <AddNewTask
  onClose={handleCloseMaskebarDialog}
  mode="maskebari"
/>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="allTask">
          {isLoading ? (
            <div className="gap-4 mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 w-full mb-32 rounded-2xl p-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <TaskCardSkeleton key={idx} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              message="No tasks assigned yet"
              description="Get started by creating your first task to stay organized and productive."
            />
          ) : (
            <div className="gap-4 mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3  w-full  mb-32  rounded-2xl p-5">
              {renderTasks("todo", "bg-orange-500")}
              {renderTasks("in-progress", "bg-blue-500")}
              {renderTasks("completed", "bg-green-600")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todo">
          {getFilteredTasks("todo").length === 0 ? (
            <EmptyState
              message="No todo tasks"
              description="All caught up! No pending tasks at the moment."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {renderTasks("todo", "bg-orange-500")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {getFilteredTasks("in-progress").length === 0 ? (
            <EmptyState
              message="No tasks in progress"
              description="Start working on your todo tasks to see them here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {renderTasks("in-progress", "bg-blue-500")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {getFilteredTasks("completed").length === 0 ? (
            <EmptyState
              message="No completed tasks"
              description="Complete some tasks to see your achievements here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {renderTasks("completed", "bg-green-600")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Assignment;
