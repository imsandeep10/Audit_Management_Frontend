 import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ActivityFeed } from "../ActivityFeed";
import { PeriodSelector } from "../PeriodSelector";
import { useEmployeeActivities } from "../../../hooks/useActivities";
import { useAuth } from "../../../contexts/AuthContext";
import { Skeleton } from "../../ui/skeleton";



export const EmployeeActivitiesPage = () => {

  const { user } = useAuth();    

  const location = useLocation();

  const employeeId = location.state?.employeeId || user?._id;
  const employeeName = location.state?.employeeName || user?.fullName;

  const [period, setPeriod] = useState("today");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const {
    data: { activities, pagination } = { activities: [], pagination: null },
    isLoading,
    error,
    isFetching
  } = useEmployeeActivities(employeeId, period, page, limit);

  if (!employeeId) {
    return (
      <div className="p-8 text-center text-red-500">
        No employee selected. Please go back and select an employee from the employee table.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{employeeName}'s Activity Log</h1>
        <div className="flex items-center gap-4">
          <PeriodSelector value={period} onChange={setPeriod} />
          <select 
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded p-2"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Total Activities</h3>
          <p className="text-2xl font-bold">{pagination?.total ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Period</h3>
          <p className="text-xl capitalize">{period.replace("this", "")}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Current Page</h3>
          <p className="text-sm">{page} of {pagination?.totalPages || 1}</p>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
        {isLoading || isFetching ? (
          <div>
            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" /> */}
            <Skeleton />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">
            Error: {error.message}
          </div>
        ) : (
          <>
            {activities.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                No activities found for this period
              </div>
            ) : (
              <ActivityFeed
                activities={activities}
                showUser={false}
              />
            )}
          </>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 -mb-12">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!pagination?.hasPrevPage}
            className={`px-4 py-2 rounded ${!pagination?.hasPrevPage ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!pagination?.hasNextPage}
            className={`px-4 py-2 rounded ${!pagination?.hasNextPage ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};