import { MessageCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

const SubTaskItem = ({
  taskId,
  subTask,
  onSubTaskToggle,
  onOpenNoteDialog,
}: {
  taskId: string;
  subTask: any;
  onSubTaskToggle: (
    taskId: string,
    subTaskId: string,
    currentStatus: string
  ) => void;
  onOpenNoteDialog: (taskId: string, subTaskId: string, subTaskTitle: string) => void;
}) => {
  return (
    <li className="flex flex-col p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <button
            onClick={() =>
              subTask._id &&
              onSubTaskToggle(taskId, subTask._id, subTask.status)
            }
            className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${subTask.status === "completed"
              ? "bg-green-500 text-white"
              : "border border-gray-300"
              }`}
          >
            {subTask.status === "completed" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <span
            className={`flex-1 ${subTask.status === "completed"
              ? "line-through text-gray-400"
              : "text-gray-700"
              }`}
          >
            {subTask.taskTitle}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded mr-3 ${subTask.status === "completed"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
            }`}
        >
          {subTask.status}
        </span>
        {subTask.status !== "completed" && (
          <Button
            type="button"
            variant={"outline"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenNoteDialog(taskId, subTask._id, subTask.taskTitle);
            }}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Notes ({subTask.notes?.length || 0})
          </Button>
        )}
      </div>
    </li>
  );
};

export default SubTaskItem;
