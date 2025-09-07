import { useState } from "react";
import { type TaskWithDetails } from "../../types/task";
import SubTaskItem from "./SubTaskItem";
import AmountDialog from "./AmountDialog";
import type { TaskWithDetails as LocalTaskWithDetails } from "./AmountDialog";

const TaskCard = ({
  task,
  onSubTaskToggle,
  onStatusChange,
  onOpenNoteDialog,
}: {
  task: TaskWithDetails;
  onSubTaskToggle: (
    taskId: string,
    subTaskId: string,
    currentStatus: string
  ) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onOpenNoteDialog: (taskId: string, subTaskId: string, subTaskTitle: string) => void;
}) => {
  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [selectedSubTaskForAmount, setSelectedSubTaskForAmount] = useState<{
    taskId: string;
    subTaskId: string;
    currentStatus: string;
  } | null>(null);

  const totalSubTasks = task.subTasks?.length || 0;
  const completedSubTasks =
    task.subTasks?.filter((st) => st.status === "completed").length || 0;
  const progress =
    totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0;

  const getTaskTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'trimester':
        return 'bg-purple-100 text-purple-800';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'ITR':
        return 'bg-green-100 text-green-800';
      case 'Estimated Return':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubTaskToggle = (
    taskId: string,
    subTaskId: string,
    currentStatus: string
  ) => {
    // Check if task has a taskType and subtask is being marked as completed
    if ((task as any).taskType && currentStatus !== "completed") {
      // Show amount dialog for tasks with taskType when completing
      setSelectedSubTaskForAmount({ taskId, subTaskId, currentStatus });
      setAmountDialogOpen(true);
    } else {
      // Direct toggle for tasks without taskType or when uncompleting
      onSubTaskToggle(taskId, subTaskId, currentStatus);
    }
  };

  const handleSaveAmount = async () => {
    if (selectedSubTaskForAmount) {
      try {
        
        // Complete the subtask after saving amounts
        onSubTaskToggle(
          selectedSubTaskForAmount.taskId,
          selectedSubTaskForAmount.subTaskId,
          selectedSubTaskForAmount.currentStatus
        );
        
        // Close dialog and reset state
        setAmountDialogOpen(false);
        setSelectedSubTaskForAmount(null);
      } catch (err) {
        console.error("Failed to save amounts:", err);
      }
    }
  };

  // Convert task to AmountDialog compatible format
  const getTaskForAmountDialog = (): LocalTaskWithDetails => ({
    ...task,
    taskType: (task as any)?.taskType || "",
    amounts: [], // Always empty since we don't want to edit existing values
    client: Array.isArray(task.client) ? task.client : [],
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {task.taskTitle}
              </h3>
              {(task as any).taskType && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor((task as any).taskType)}`}>
                  {(task as any).taskType.charAt(0).toUpperCase() + (task as any).taskType.slice(1)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === "completed"
                ? "bg-green-100 text-green-800"
                : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-800"
                  : task.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">{task.description}</p>
        </div>
        {/* Task Type Section */}
        {(task as any).taskType && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Task Type</h4>
                <p className="text-lg font-semibold text-gray-800">
                  {(task as any).taskType.charAt(0).toUpperCase() + (task as any).taskType.slice(1)}
                </p>
              </div>
            </div>
          </div>
        )}
        {totalSubTasks > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                Progress: {completedSubTasks}/{totalSubTasks} subtasks
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </h4>
            <p className="font-medium text-gray-800">
              {Array.isArray(task.client)
                ? task.client.map((c, idx, arr) => {
                    let clientName = c.companyName;
                    if (!clientName && c.user) {
                      if (typeof c.user === "string") {
                        clientName = c.user;
                      } else if (typeof c.user === "object" && "fullName" in c.user) {
                        clientName = c.user.fullName;
                      }
                    }
                    return (
                      <span key={c._id || idx}>
                        {clientName || "N/A"}
                        {idx < arr.length - 1 ? ", " : ""}
                      </span>
                    );
                  })
                : typeof task.client === "object" && task.client !== null
                  ? (() => {
                      let clientName = task.client.companyName;
                      if (!clientName && task.client.user) {
                        if (typeof task.client.user === "string") {
                          clientName = task.client.user;
                        } else if (typeof task.client.user === "object" && "fullName" in task.client.user) {
                          clientName = (task.client.user as any).fullName;
                        }
                      }
                      return clientName || "N/A";
                    })()
                  : typeof task.client === "string"
                    ? task.client
                    : "N/A"}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </h4>
            <p
              className={`font-medium ${new Date(task.dueDate) < new Date()
                ? "text-red-500"
                : "text-gray-800"
                }`}
            >
              {new Date(task.dueDate).toLocaleDateString()}
              {new Date(task.dueDate) < new Date() && (
                <span className="text-xs text-red-500 ml-1">(Overdue)</span>
              )}
            </p>
          </div>
        </div>
        {/* Subtasks */}
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Sub-tasks</h4>
            <ul className="space-y-4">
              {task.subTasks.map((subTask, index) => (
                <SubTaskItem
                  key={subTask._id || index}
                  taskId={task._id}
                  subTask={subTask}
                  onSubTaskToggle={handleSubTaskToggle}
                  onOpenNoteDialog={onOpenNoteDialog}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Amount Dialog */}
      {amountDialogOpen && selectedSubTaskForAmount && (
        <AmountDialog
          isOpen={amountDialogOpen}
          onClose={() => {
            setAmountDialogOpen(false);
            setSelectedSubTaskForAmount(null);
          }}
          onSave={handleSaveAmount}
          task={getTaskForAmountDialog()}
        />
      )}
    </>
  );
};

export default TaskCard;