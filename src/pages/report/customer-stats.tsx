import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { AlertCircle, TrendingUp, Users, DollarSign } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import type { CustomerTotal, BillAmountStats } from "../../types/clientTypes";

interface CustomerStatsData {
  customerTotals: CustomerTotal[];
  billAmountStats: BillAmountStats;
  totalClients: number;
}

 const fetchCustomerStats = async (clientId?: string): Promise<CustomerStatsData> => {
  if (clientId) {
    // Fetch stats for specific client
    const response = await axiosInstance.get(`/client/${clientId}/customer-stats`);
    return response.data.data;
  } else {
    // Fetch aggregated stats across all clients
    const response = await axiosInstance.get('/client/customer-stats-report');
    return response.data.data;
  }
};

export const CustomerStatsReport: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-stats', selectedClientId],
    queryFn: () => fetchCustomerStats(selectedClientId === 'all' ? undefined : selectedClientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch clients list for filter dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const response = await axiosInstance.get('/client/clients');
      return response.data.clients;
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Data</h3>
          <p className="text-gray-500">Failed to load customer statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer & Supplier Analytics</h1>
          <p className="text-gray-500 mt-1">Top performing customers and suppliers by revenue</p>
        </div>
        
        {/* Client Filter */}
        <div className="w-64">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select client..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clientsData?.map((client: any) => (
                <SelectItem key={client._id} value={client._id}>
                  {client.user?.fullName || client.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `NRs ${data?.billAmountStats?.totalAmount?.toLocaleString() || '0'}`
                  )}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Sales Revenue</p>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `NRs ${data?.billAmountStats?.salesTotal?.toLocaleString() || '0'}`
                  )}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Purchase Spending</p>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    `NRs ${data?.billAmountStats?.purchaseTotal?.toLocaleString() || '0'}`
                  )}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <div className="text-2xl font-bold text-purple-600">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    data?.customerTotals?.length || 0
                  )}
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers/Suppliers */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-64" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : data?.customerTotals && data.customerTotals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold">₨</span>
              </div>
              Top Customers & Suppliers by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.customerTotals.slice(0, 12).map((customer, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold truncate text-gray-900">{customer._id.customerName}</h4>
                    <Badge 
                      variant={customer._id.billType === 'sales' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {customer._id.billType === 'sales' ? 'Customer' : 'Supplier'}
                    </Badge>
                  </div>
                  
                  <div className="text-2xl font-bold text-primary">
                    NRs {customer.totalAmount.toLocaleString()}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{customer.billCount} bills</span>
                    <Badge variant="outline" className="uppercase text-xs">
                      {customer._id.registrationType}
                    </Badge>
                  </div>
                  
                  {customer.customerPan && (
                    <div className="text-xs text-gray-500 font-mono">
                      PAN: {customer.customerPan}
                    </div>
                  )}
                  
                  {customer.phoneNumber && (
                    <div className="text-xs text-gray-500">
                      Phone: {customer.phoneNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No Customer Data</h3>
              <p className="text-gray-500">No customer or supplier data available for the selected criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerStatsReport;