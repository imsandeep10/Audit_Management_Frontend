import { type TaskWithDetails } from "../../types/task";

const CompletedTaskCard = ({ task }: { task: TaskWithDetails }) => {
  const completedSubTasks =
    task.subTasks?.filter((st) => st.status === "completed").length || 0;
  const totalSubTasks = task.subTasks?.length || 0;
  const completionDate = new Date(
    task.updatedAt || task.createdAt || Date.now()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-700">
            {task.taskTitle}
          </h3>
          {(task as any).taskType && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {(task as any).taskType}
            </span>
          )}
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      </div>
      <div className="mb-3">
        <p className="text-gray-500 text-sm">{task.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-gray-500">Client:</span>
          <span className="ml-2 font-medium">
            {typeof task.client === "object" ? task.client.companyName : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Due Date:</span>
          <span className="ml-2 font-medium">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-2">
        <span>Completed on: {completionDate.toLocaleDateString()}</span>
        {completionDate.toLocaleTimeString && (
          <span className="ml-1">
            {completionDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {totalSubTasks > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${Math.round(
                  (completedSubTasks / totalSubTasks) * 100
                )}%`,
              }}
            ></div>
          </div>
          <span>
            {completedSubTasks}/{totalSubTasks}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompletedTaskCard;
