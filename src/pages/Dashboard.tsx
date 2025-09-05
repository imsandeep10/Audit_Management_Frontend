import { Card, CardContent } from "../components/ui/card";
import AssignmentProgress from "../card/AssignmentProgress";
import AssignmentAnalysis from "../card/AssignmentAnalysis";
import { FindingIssue } from "../card/FindingIssue";
import QuickAction from "../card/QuickAction";
import { FaFile, FaUserFriends } from "react-icons/fa";
import { LuChartNoAxesColumn } from "react-icons/lu";
import { RiProgress5Line } from "react-icons/ri";
import { Skeleton } from "../components/ui/skeleton";
import { useDashboardStats } from "../hooks/dashboard";
import AuditCalendar from "../components/ui/nepaliCalender";

interface CardData {
  id: number;
  title: string;
  count: number;
  icon: React.ElementType;
  iconColor: string;
}

const Dashboard: React.FC = () => {
  const {
    totalEmployees,
    totalClients,
    totalTasks,
    totalActivityLogs,
    isLoading,
    error,
  } = useDashboardStats();

  const cardData: CardData[] = [
    {
      id: 1,
      title: "Total Employees",
      count: totalEmployees.data || 0,
      icon: FaUserFriends,
      iconColor: "#0E2258",
    },
    {
      id: 2,
      title: "Total Clients",
      count: totalClients.data || 0,
      icon: RiProgress5Line,
      iconColor: "#210EAB",
    },
    {
      id: 3,
      title: "Active client File",
      count: totalTasks.data || 0,
      icon: FaFile,
      iconColor: "#F5AC00",
    },
    {
      id: 4,
      title: "Total Activity Logs",
      count: totalActivityLogs.data || 0,
      icon: LuChartNoAxesColumn,
      iconColor: "#000000",
    },
  ];

  if (isLoading)
    return (
      <div className="h-screen w-full overflow-y-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-10 md:pt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-lg border border-gray-100">
              <CardContent className="p-6 flex flex-row justify-between items-center">
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar + FindingIssue + QuickAction Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-5 pt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-lg border border-gray-100">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assignment Progress + Analysis Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 py-5 mb-28 md:mb-20">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="rounded-lg border border-gray-100">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

  if (error) return <div>Error loading dashboard data</div>;

  return (
    <>
      <div className="h-screen w-full overflow-y-auto px-5 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-10 md:pt-5">
          {cardData.map((data: CardData) => (
            <Card
              key={data.id}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 rounded-lg border border-gray-100 card-custom "
            >
              <CardContent className="relative flex flex-row justify-between items-center w-full h-full p-6">
                <div className="flex flex-col space-y-1">
                  <h3 className="text-sm md:text-base lg:text-lg font-medium text-gray-600">
                    {data.title}
                  </h3>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                    {data.count}
                  </h1>
                </div>
                <div
                  className="p-3 rounded-full bg-opacity-20"
                  style={{ backgroundColor: `${data.iconColor}20` }}
                >
                  <data.icon
                    className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                    style={{ color: data.iconColor }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-5 pt-5">
          <AuditCalendar />
          <FindingIssue />
          <QuickAction />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 py-5 mb-28 md:mb-20">
          <AssignmentProgress />
          <AssignmentAnalysis />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
