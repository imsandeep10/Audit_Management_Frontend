import { EmployeeActivitiesPage } from "../../components/activities/employeeActivities/EmployeeActivity";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../hooks/useAuth";

export const ActivityLog = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div>
        <Skeleton />
      </div>
    );
  }

  return <EmployeeActivitiesPage />;
};
