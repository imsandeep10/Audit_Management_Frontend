import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CalendarIcon, FileText, AlertCircle } from "lucide-react";
import { getCurrentNepalieFiscalYear, generateFiscalYearOptions } from "../../utils/fiscalYear";
import { useITRReport } from "../../hooks/useReports";

export default function ITRReport() {
  const [fiscalYear, setFiscalYear] = useState<string>(getCurrentNepalieFiscalYear());

  const fiscalYearOptions = generateFiscalYearOptions(5, 2);

  const { 
    data: reportData, 
    isLoading: loading, 
    isError, 
    error,
    refetch 
  } = useITRReport(fiscalYear);

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
    <div className="container mx-auto p-6 space-y-6 mr-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ITR Report</h1>
          <p className="text-muted-foreground">
            Income Tax Return tasks completion report for fiscal year {fiscalYear}
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
          <button
            onClick={() => refetch()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error?.message || "Failed to fetch ITR report data. Please try again."}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total ITR Tasks</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totals.totalTasks}</div>
                <p className="text-xs text-muted-foreground">Completed ITR tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Taxable Amount</CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">रु {formatAmount(reportData.totals.totalTaxableAmount)}</div>
                <p className="text-xs text-muted-foreground">Across all clients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tax Amount</CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">रु {formatAmount(reportData.totals.totalTaxAmount)}</div>
                <p className="text-xs text-muted-foreground">Tax calculated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Turnover</CardTitle>
                
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">रु {formatAmount(reportData.totals.totalTaskAmount)}</div>
                <p className="text-xs text-muted-foreground">Total Turnover</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>ITR Tasks Details</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Title</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead className="text-right">Taxable Amount</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                      <TableHead className="text-right">Total Turnover</TableHead>
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
                        <TableCell>{task.companyName}</TableCell>
                        
                        <TableCell>{task.clientName}</TableCell>
                        <TableCell className="text-right font-mono">
                          रु {formatAmount(task.taxableAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          रु {formatAmount(task.taxAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          रु {formatAmount(task.taskAmount)}
                        </TableCell>
                        <TableCell>{formatDate(task.completedDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No ITR tasks found for the selected fiscal year.
                </div>
              )}
            </CardContent>
          </Card>   
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Failed to load ITR report data.
        </div>
      )}
    </div>
  );
}