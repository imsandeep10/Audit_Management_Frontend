import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { HalfCircleProgress } from "./HalfCircleProgress";
import { IoEllipse } from "react-icons/io5";
import axiosInstance from "../api/axiosInstance";

interface TaskStatusData {
  counts: {
    todo: number;
    "in-progress": number;
    completed: number;
    cancelled: number;
    total: number;
  };
  percentages: {
    todo: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  overallProgress: number;
}

const fetchTaskStatusAnalysis = async (): Promise<TaskStatusData> => {
  const response = await axiosInstance.get("/dashboard/task-status-analysis");
  return response.data.data;
};

const AssignmentAnalysis = () => {
  const { data, isLoading, isError } = useQuery<TaskStatusData>({
    queryKey: ["taskStatusAnalysis"],
    queryFn: fetchTaskStatusAnalysis,
  });

  if (isLoading) {
    return (
      <Card className="px-5 card-custom">
        <h3 className="text-xl font-semibold">Assignment Analysis</h3>
        <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
        <CardContent>
          <div className="flex justify-center items-center">
            <HalfCircleProgress progress={0} />
          </div>
          <p className="text-center text-2xl font-semibold">Loading...</p>
          <ul className="flex flex-col justify-center gap-8 font-normal pt-10">
            {[...Array(4)].map((_, index) => (
              <li key={index} className="flex flex-col gap-2">
                <div className="animate-pulse h-6 bg-gray-200 rounded w-full"></div>
                <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="px-5 card-custom">
        <h3 className="text-xl font-semibold">Assignment Analysis</h3>
        <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
        <CardContent>
          <p className="text-red-500 text-center">
            Error loading analysis data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="px-5 card-custom">
      <h3 className="text-xl font-semibold">Assignment Analysis</h3>
      <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
      <CardContent>
        <div className="flex justify-center items-center">
          <HalfCircleProgress progress={data?.overallProgress || 0} />
        </div>
        <p className="text-center text-2xl font-semibold">Overall Progress</p>
        <ul className="flex flex-col justify-center gap-8 font-normal pt-10">
          <li className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-5">
              <span>
                <IoEllipse className="text-xl text-[#B90101]" />
              </span>
              <span className="text-xl text-nowrap">To Do</span>
              <span className="flex justify-end w-full text-xl">
                {data?.counts.todo} ({data?.percentages.todo}%)
              </span>
            </div>
            <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
          </li>

          <li className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-5">
              <span>
                <IoEllipse className="text-xl text-[#664DA8]" />
              </span>
              <span className="text-xl text-nowrap">In Progress</span>
              <span className="flex justify-end w-full text-xl">
                {data?.counts["in-progress"]} ({data?.percentages.inProgress}%)
              </span>
            </div>
            <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
          </li>

          <li className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-5">
              <span>
                <IoEllipse className="text-xl text-[#3A75FF]" />
              </span>
              <span className="text-xl text-nowrap">Completed</span>
              <span className="flex justify-end w-full text-xl">
                {data?.counts.completed} ({data?.percentages.completed}%)
              </span>
            </div>
            <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
          </li>

          <li className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-5">
              <span>
                <IoEllipse className="text-xl text-[#098552]" />
              </span>
              <span className="text-xl text-nowrap">Cancelled</span>
              <span className="flex justify-end w-full text-xl">
                {data?.counts.cancelled} ({data?.percentages.cancelled}%)
              </span>
            </div>
            <div className="w-full h-0.5 bg-[#7F7F7F]"></div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AssignmentAnalysis;
