"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "../../components/ui/chart";
import { clientService } from "../../api/clientService";

interface ClientStats {
  name: string;
  count: number;
}

type FilterType = 'clientType' | 'clientNature' | 'registeredUnder' | 'IRDoffice' | 'fillingperiod';

export function ChartAreaUsers() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('clientType');
  const [chartData, setChartData] = useState<ClientStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = [
    { value: 'clientType', label: 'Client Types', description: 'Distribution by client type (Individual, Company, etc.)' },
    { value: 'clientNature', label: 'Client Nature', description: 'Distribution by client nature/business type' },
    { value: 'registeredUnder', label: 'Registration Under', description: 'Distribution by VAT/PAN registration' },
    { value: 'IRDoffice', label: 'IRD Office', description: 'Distribution by IRD office location' },
    { value: 'fillingperiod', label: 'Filling Period', description: 'Distribution by filling period (Monthly, Trimester)' }
  ];

  const chartConfig = {
    count: { 
      label: "Count", 
      color: "#3b82f6" 
    },
  } satisfies ChartConfig;

  // Define colors for different chart categories
  const getBarColor = (index: number) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    return colors[index % colors.length];
  };

  // Dynamic Y-axis configuration based on data range
  const getYAxisConfig = () => {
    const maxValue = Math.max(...chartData.map(item => item.count), 0);
    
    if (maxValue === 0) {
      return { domain: [0, 10], tickCount: 6 };
    } else if (maxValue <= 5) {
      return { domain: [0, maxValue + 1], tickCount: maxValue + 2 };
    } else if (maxValue <= 10) {
      return { domain: [0, maxValue + 2], tickCount: Math.min(maxValue + 3, 8) };
    } else if (maxValue <= 20) {
      return { domain: [0, Math.ceil(maxValue / 2) * 2], tickCount: 6 };
    } else if (maxValue <= 50) {
      return { domain: [0, Math.ceil(maxValue / 5) * 5], tickCount: 6 };
    } else if (maxValue <= 100) {
      return { domain: [0, Math.ceil(maxValue / 10) * 10], tickCount: 6 };
    } else if (maxValue <= 500) {
      return { domain: [0, Math.ceil(maxValue / 25) * 25], tickCount: 6 };
    } else if (maxValue <= 1000) {
      return { domain: [0, Math.ceil(maxValue / 50) * 50], tickCount: 6 };
    } else if (maxValue <= 5000) {
      return { domain: [0, Math.ceil(maxValue / 250) * 250], tickCount: 6 };
    } else if (maxValue <= 10000) {
      return { domain: [0, Math.ceil(maxValue / 500) * 500], tickCount: 6 };
    } else {
      return { domain: [0, Math.ceil(maxValue / 1000) * 1000], tickCount: 6 };
    }
  };

  // Format numbers for display (add commas for thousands)
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const fetchClientStats = async (filterType: FilterType) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the optimized statistics endpoint
      const response = await clientService.getClientStatistics(filterType);
      
      if (response.data && Array.isArray(response.data)) {
        // Format the data for the chart
        const data = response.data.map((item: any) => ({
          name: item.name || 'Not Specified',
          count: item.count || 0
        }));

        setChartData(data);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Error fetching client stats:', err);
      setError('Failed to load client statistics');
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientStats(selectedFilter);
  }, [selectedFilter]);

  const getCurrentFilter = () => {
    return filterOptions.find(option => option.value === selectedFilter);
  };

  const totalClients = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Client Distribution Analysis</CardTitle>
            <CardDescription>
              {getCurrentFilter()?.description || 'Client statistics overview'}
            </CardDescription>
          </div>
          <Select value={selectedFilter} onValueChange={(value: FilterType) => setSelectedFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-sm text-gray-500">Loading client statistics...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-sm text-red-500">{error}</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-sm text-gray-500">No data available</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={getYAxisConfig().domain}
                  tickCount={getYAxisConfig().tickCount}
                  tickFormatter={formatNumber}
                  allowDecimals={false}
                  type="number"
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const percentage = totalClients > 0 ? ((data.value as number / totalClients) * 100).toFixed(1) : '0';
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-blue-600">
                            Count: <span className="font-bold">{formatNumber(data.value as number)}</span>
                          </p>
                          <p className="text-gray-600 text-sm">
                            {percentage}% of total clients
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Total clients analyzed: {formatNumber(totalClients)}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing distribution by {getCurrentFilter()?.label.toLowerCase()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
