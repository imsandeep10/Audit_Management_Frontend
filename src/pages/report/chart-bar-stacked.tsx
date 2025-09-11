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
import { useGetMonthlyUserReport } from "../../api/useReport";

export const description = "A stacked bar chart showing completed vs uncompleted";

const chartConfig = {
  completedTasks: {
    label: "Completed",
    color: "#10b981", // emerald
  },
  uncompletedTasks: {
    label: "Uncompleted",
    color: "#f59e0b", // amber
  },
} satisfies ChartConfig;
export function ChartBarStacked() {
  const { data } = useGetMonthlyUserReport();
  console.log(data,"data")
  const payload = data?.data as any;
  const apiData = Array.isArray(payload?.data) ? payload.data : [];
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const fullToAbbrev: Record<string, string> = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };

  // Seed all months to avoid a single giant bar when data collapses
  const monthToCounts: Record<string, { completedTasks: number; uncompletedTasks: number }> = monthLabels.reduce(
    (acc, m) => {
      acc[m] = { completedTasks: 0, uncompletedTasks: 0 };
      return acc;
    },
    {} as Record<string, { completedTasks: number; uncompletedTasks: number }>
  );

  for (const row of apiData) {
    const key = fullToAbbrev[row.month as keyof typeof fullToAbbrev];
    if (!key) continue;
    monthToCounts[key].completedTasks = row.completed ?? 0;
    monthToCounts[key].uncompletedTasks = row.nonCompleted ?? 0;
  }

  const chartData = monthLabels.map((m) => ({ name: m, ...monthToCounts[m] }));

  const totals = Object.values(monthToCounts).reduce(
    (acc, v) => {
      acc.completed += v.completedTasks;
      acc.uncompleted += v.uncompletedTasks;
      return acc;
    },
    { completed: 0, uncompleted: 0 }
  );
  const getSubtitle = () => `Total: ${totals.completed + totals.uncompleted}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Overview</CardTitle>
        <CardDescription>{getSubtitle()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="completedTasks"
              stackId="a"
              fill="var(--color-completedTasks)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="uncompletedTasks"
              stackId="a"
              fill="var(--color-uncompletedTasks)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
