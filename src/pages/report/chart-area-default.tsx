"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { useGetMonthlyUserReport } from "../../api/useReport";

export function ChartAreaUsers() {
  const { data } = useGetMonthlyUserReport();
  const chartData = data?.data || [];

  const getDateRange = () => {
    if (!chartData || chartData.length === 0) return "No data available";

    const firstMonth = chartData[0]?.month;
    const lastMonth = chartData[chartData.length - 1]?.month;

    if (firstMonth && lastMonth) {
      return `${firstMonth} - ${lastMonth}` + " " + new Date().getFullYear();
    }
    return "Monthly User Overview";
  };
  const chartConfig = {
    totalUsers: { label: "Total Users", color: "#4b5563" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly User Overview</CardTitle>
        <CardDescription>{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="totalUsers"
              type="natural"
              fill="var(--color-totalUsers)"
              fillOpacity={0.4}
              stroke="var(--color-totalUsers)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
