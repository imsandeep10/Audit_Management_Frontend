import { type Activity } from "../../types/activity";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  activities: Activity[];
  showUser?: boolean;
}

export const ActivityFeed = ({
  activities,
  showUser = true,
}: ActivityFeedProps) => {
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  if (!activities || activities.length === 0) {
    return (
      <div className="p-4 text-centeext-gray-500">No activities found</div>
    );
  }

  return (
    <div className="space-y-6 bg-transparent backdrop:backdrop-blur-3xl p-4 rounded-lg shadow-sm">
      {Object.entries(activitiesByDate).map(([date, dailyActivities]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 sticky top-0 bg-white py-2 px-4 z-10">
            {date}
          </h3>
          {dailyActivities.map((activity) => (
            <ActivityItem
              key={activity._id}
              activity={activity}
              showUser={showUser}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface ActivityItemProps {
  activity: Activity;
  showUser?: boolean;
}

const ActivityItem = ({ activity, showUser = true }: ActivityItemProps) => {
  const {
    actionDescription,
    targetResource,
    userId,
    createdAt,
    status,
    metadata,
  } = activity;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-transparent ">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{actionDescription}</h3>
          <p className="text-sm text-gray-500">
            {targetResource?.resourceType}: {targetResource?.resourceName}
          </p>
          {showUser && userId && (
            <p className="text-xs text-gray-400 mt-1">
              User: {userId.fullName}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "success"
              ? "bg-green-100 text-green-800"
              : status === "failed"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
        <span className="ml-2">{metadata?.ipAddress}</span>
        {metadata?.userAgent && (
          <span className="ml-2 hidden md:inline">
            {getDeviceIcon(metadata.userAgent)}
          </span>
        )}
      </div>
    </div>
  );
};

// Helper function remains the same
const getDeviceIcon = (userAgent: string) => {
  if (userAgent.includes("Mobile")) return "📱 Mobile";
  if (userAgent.includes("Postman")) return "🛠️ API Client";
  return "💻 Desktop";
};
