
import { useGetTasks } from "../../api/useTask";
import MaskebariRecords from "../../components/create-client/AmountSection";
import ReportCards from "../../components/report/ReportCards";
import { ChartAreaUsers } from "./chart-area-default";
import { ChartBarStacked } from "./chart-bar-stacked";


const Report = () => {
const {data:tasks,isLoading,isError}=useGetTasks()

  const allTasks = tasks?.tasks || [];
  const ITRCount = allTasks.filter((task: any) => task.taskType === "ITR").length;
  const EstimatedRevenueCount = allTasks.filter((task: any) => task.taskType === "Estimated Return").length;
  const MonthlyCount = allTasks.filter((task: any) => task.taskType === "Monthly").length;
  const TrimesterCount = allTasks.filter((task: any) => task.taskType === "Trimester").length;

  const cardData: { label: string; data: string }[] = [
    {
      label: "ITR Tasks",
      data: isLoading ? "Loading..." : ITRCount.toString(),
    },
    {
      label: "Estimated Revenue Tasks",
      data: isLoading ? "Loading..." : EstimatedRevenueCount.toString(),
    },
    {
      label: "Monthly Tasks",
      data: isLoading ? "Loading..." : MonthlyCount.toString(),
    },
    {
      label: "Trimester Tasks",
      data: isLoading ? "Loading..." : TrimesterCount.toString(),
    },
 
  ];

  if (isError) {
    console.error("Error loading maskebari data");
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-4 overflow-y-auto h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cardData.map((card, index) => (
          <ReportCards key={index} label={card.label} data={card.data} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="w-full min-h-[300px] sm:min-h-[400px]">
          <ChartBarStacked />
        </div>
        <div className="w-full min-h-[300px] sm:min-h-[400px]">
          <ChartAreaUsers />
        </div>
      </div>
      
      {/* customer stats starts */}
      <div className="mt-6 sm:mt-8">
        <MaskebariRecords />
      </div>
    </div>
  );
};

export default Report;