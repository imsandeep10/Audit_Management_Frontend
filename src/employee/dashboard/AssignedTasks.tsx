import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { type TaskWithDetails } from "../../types/task";
import {
  useEmployeeTasks,
  useUpdateSubTaskStatus,
} from "../../hooks/useEmployeeTask";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import NoteConversationDialog from "../../components/notes/NoteConversationDialog";
import AmountDialog from "./AmountDialog";
import type { TaskWithDetails as LocalTaskWithDetails } from "./AmountDialog";
import TaskCard from "./TaskCard";
import CompletedTaskCard from "./CompletedTaskCard";

import { AddNewEmployeeTask } from "./AddTasksByEmployee";

const EmployeeAssignedTasks = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTasks, setActiveTasks] = useState<TaskWithDetails[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskWithDetails[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedSubTaskForNotes, setSelectedSubTaskForNotes] = useState<{
    taskId: string;
    subTaskId: string;
    subTaskTitle: string;
  } | null>(null);
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [selectedTaskForAmount, setSelectedTaskForAmount] = useState<LocalTaskWithDetails | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  
  // Dialog states for notifications
  const [selectedTaskForDialog, setSelectedTaskForDialog] = useState<TaskWithDetails | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const employeeId = user?.employee?._id;
  
  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployeeTasks(employeeId || ""); 
  
  const { mutate: updateStatus } = useUpdateSubTaskStatus();
  

  useEffect(() => {
    if (tasks) {
      const active = tasks.filter((task: TaskWithDetails) => task.status !== "completed");
      const completed = tasks.filter((task: TaskWithDetails) => task.status === "completed");
      setActiveTasks(active);
      setCompletedTasks(completed);
    }
  }, [tasks]);

  // Handle dialog opening from URL parameters (notification clicks)
  useEffect(() => {
    const openTaskParam = searchParams.get('openTask');
    const openSubtaskParam = searchParams.get('openSubtask');

    if (tasks && tasks.length > 0) {
      // Handle opening task dialog from notification
      if (openTaskParam) {
        const taskToOpen = tasks.find((task: TaskWithDetails) => task._id === openTaskParam);
        if (taskToOpen) {
          setSelectedTaskForDialog(taskToOpen);
          setIsTaskDialogOpen(true);

          // If there's a subtask to open, open the note dialog as well
          if (openSubtaskParam) {
            const subtaskToOpen = taskToOpen.subTasks?.find((st: any) => st._id === openSubtaskParam);
            if (subtaskToOpen) {
              setSelectedSubTaskForNotes({
                taskId: openTaskParam,
                subTaskId: openSubtaskParam,
                subTaskTitle: subtaskToOpen.taskTitle
              });
              setNoteDialogOpen(true);
            }
          }

          // Clean up URL parameters after opening dialogs
          const cleanupTimer = setTimeout(() => {
            setSearchParams(prev => {
              const newParams = new URLSearchParams(prev);
              newParams.delete('openTask');
              newParams.delete('openSubtask');
              newParams.delete('highlightNote');
              return newParams;
            });
          }, 500);

          return () => clearTimeout(cleanupTimer);
        }
      }
    }
  }, [searchParams, tasks, setSearchParams]);

  const handleSubTaskToggle = async (
    taskId: string,
    subTaskId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus =
        currentStatus === "completed" ? "in-progress" : "completed";
      updateStatus({
        taskId,
        subTaskId,
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update subtask:", err);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Check if task is being marked as completed and is monthly/trimester type
      if (newStatus === "completed") {
        const task = tasks?.find((t: TaskWithDetails) => t._id === taskId);
        const taskType = (task as any)?.taskType?.toLowerCase();
        if (taskType === "monthly" || taskType === "trimester") {
          // Map to local TaskWithDetails shape for AmountDialog
          setSelectedTaskForAmount({
            ...task!,
            taskType: (task as any)?.taskType || "", // fallback if missing
            amounts: [], // Always empty since we don't want to edit existing values
            client: Array.isArray(task?.client) ? task?.client : [],
          });
          setAmountDialogOpen(true);
          return;
        }
      }
      await updateStatus({ taskId, status: newStatus });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleOpenNoteDialog = (taskId: string, subTaskId: string, subTaskTitle: string) => {
    setSelectedSubTaskForNotes({
      taskId,
      subTaskId,
      subTaskTitle,
    });
    setNoteDialogOpen(true);
  };

  const handleSaveAmount = async () => {
    if (selectedTaskForAmount) {
      try {
        // Update task status to completed after saving amounts
        await updateStatus({ taskId: selectedTaskForAmount._id, status: "completed" });
        // Refresh the tasks data after saving amounts
        await refetch();
        setSelectedTaskForAmount(null);
        setAmountDialogOpen(false);
      } catch (err) {
        console.error("Failed to save amounts:", err);
      }
    }
  };

  // Dialog handler functions for notifications
  const handleTaskDialogClose = () => {
    setIsTaskDialogOpen(false);
    setSelectedTaskForDialog(null);
  };

  const handleNoteDialogClose = () => {
    setNoteDialogOpen(false);
    setSelectedSubTaskForNotes(null);
  };

  // Early returns AFTER all hooks have been called
  if (!employeeId) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No employee ID found. Please log in again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center p-4">Error: {error?.message || 'An error occurred'}</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
        <div className="flex gap-3">
         
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            Add task
          </button>
        </div>
      </div>

      {showAddTask ? (
        <AddNewEmployeeTask
          onClose={() => setShowAddTask(false)}
          onSuccess={() => {
            setShowAddTask(false);
            refetch();
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Tasks Column */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                Active Tasks ({activeTasks.length})
              </h3>

              {activeTasks.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-500 mt-2">No active tasks assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onSubTaskToggle={handleSubTaskToggle}
                      onStatusChange={handleTaskStatusChange}
                      onOpenNoteDialog={handleOpenNoteDialog}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks Column */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                Completed Tasks ({completedTasks.length})
              </h3>

              {completedTasks.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 mt-2">No tasks completed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <CompletedTaskCard key={task._id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Dialog */}
          <Dialog open={isTaskDialogOpen} onOpenChange={handleTaskDialogClose}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedTaskForDialog?.taskTitle}</DialogTitle>
                <DialogDescription>
                  {selectedTaskForDialog?.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p><strong>Status:</strong> {selectedTaskForDialog?.status}</p>
                  <p><strong>Due Date:</strong> {selectedTaskForDialog?.dueDate ? new Date(selectedTaskForDialog.dueDate).toLocaleDateString() : 'Not set'}</p>
                  <p><strong>Client:</strong> {Array.isArray(selectedTaskForDialog?.client) 
                    ? selectedTaskForDialog.client.map((c: any) => typeof c === 'string' ? c : c.companyName).join(', ') 
                    : typeof selectedTaskForDialog?.client === 'string' 
                      ? selectedTaskForDialog.client 
                      : (selectedTaskForDialog?.client as any)?.companyName || 'Unknown'
                  }</p>
                </div>
                {selectedTaskForDialog?.subTasks && selectedTaskForDialog.subTasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Subtasks:</h4>
                    <ul className="space-y-1">
                      {selectedTaskForDialog.subTasks.map((subTask: any) => (
                        <li key={subTask._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{subTask.taskTitle}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            subTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                            subTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subTask.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Note Conversation Dialog */}
          {selectedSubTaskForNotes && (
            <NoteConversationDialog
              isOpen={noteDialogOpen}
              onClose={handleNoteDialogClose}
              taskId={selectedSubTaskForNotes.taskId}
              subTaskId={selectedSubTaskForNotes.subTaskId}
              subTaskTitle={selectedSubTaskForNotes.subTaskTitle}
              currentUserName={user?.fullName || "Employee"}
            />
          )}

          {/* Amount Dialog */}
          {selectedTaskForAmount && (
            <AmountDialog
              isOpen={amountDialogOpen}
              onClose={() => {
                setAmountDialogOpen(false);
                setSelectedTaskForAmount(null);
              }}
              onSave={handleSaveAmount}
              task={selectedTaskForAmount}
            />
          )}
        </>
      )}
    </div>
  );
};

export { EmployeeAssignedTasks };