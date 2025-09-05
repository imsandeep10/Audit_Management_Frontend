"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";
import { useGetMonthlyReport } from "../../api/useReport";

export const description = "A stacked bar chart with a legend";

const chartConfig = {
  totalTasks: {
    label: "Total Tasks",
    color: "#e5e7eb", // light gray
  },
  overdueTasks: {
    label: "Overdue Tasks",
    color: "#ef4444", // red
  },
} satisfies ChartConfig;
export function ChartBarStacked() {
  const { data } = useGetMonthlyReport();
  const chartData = data?.data || [];

  const getDateRange = () => {
    if (!chartData || chartData.length === 0) return "No data available";

    const firstMonth = chartData[0]?.month;
    const lastMonth = chartData[chartData.length - 1]?.month;

    if (firstMonth && lastMonth) {
      return `${firstMonth} - ${lastMonth}` + " " + new Date().getFullYear();
    }
    return "Monthly Task Overview";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Task Overview</CardTitle>
        <CardDescription>{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="totalTasks"
              stackId="a"
              fill="var(--color-totalTasks)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="overdueTasks"
              stackId="a"
              fill="var(--color-overdueTasks)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
