import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CalendarIcon, FileText, AlertCircle } from "lucide-react";
import { getCurrentNepalieFiscalYear, generateFiscalYearOptions } from "../../utils/fiscalYear";
import { useEstimatedReturnReport } from "../../hooks/useReports";

export default function EstimatedReturnReport() {
  const [fiscalYear, setFiscalYear] = useState<string>(getCurrentNepalieFiscalYear());

  const fiscalYearOptions = generateFiscalYearOptions(5, 2);

  const { 
    data: reportData, 
    isLoading: loading, 
    isError, 
    error,
    refetch 
  } = useEstimatedReturnReport(fiscalYear);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

//   const handleExportToExcel = () => {
//     // TODO: Implement Excel export functionality
//     alert("Excel export feature will be implemented soon");
//   };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimated Return Report</h1>
          <p className="text-muted-foreground">
            Estimated Return tasks completion report for fiscal year {fiscalYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={fiscalYear} onValueChange={setFiscalYear}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="h-4 w-4" />
              <SelectValue placeholder="Select Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              {fiscalYearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <Button onClick={handleExportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button> */}
        </div>
      </div>

      {isError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error?.message || "Failed to fetch Estimated Return report data. Please try again."}</span>
            <button 
              onClick={() => refetch()} 
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totals.totalTasks}</div>
                <p className="text-xs text-muted-foreground">Completed Estimated Return tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estimated Revenue</CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">रु {formatAmount(reportData.totals.totalEstimatedRevenue)}</div>
                <p className="text-xs text-muted-foreground">Across all clients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Net Profit</CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">रु {formatAmount(reportData.totals.totalNetProfit)}</div>
                <p className="text-xs text-muted-foreground">Profit calculated</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Estimated Return Tasks Details</CardTitle>
              
            </CardHeader>
            <CardContent>
              {reportData.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Title</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead className="text-right">Estimated Revenue</TableHead>
                      <TableHead className="text-right">Net Profit</TableHead>
                      <TableHead>Completed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.data.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{task.taskTitle}</div>
                            
                          </div>
                        </TableCell>
                        <TableCell>{task.clientName}</TableCell>
                        <TableCell>{task.companyName}</TableCell>
                       
                        <TableCell className="text-right font-mono">
                          रु {formatAmount(task.estimatedRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          रु {formatAmount(task.netProfit)}
                        </TableCell>
                        <TableCell>{formatDate(task.completedDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No Estimated Return tasks found for the selected fiscal year.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Failed to load Estimated Return report data.
        </div>
      )}
    </div>
  );
}