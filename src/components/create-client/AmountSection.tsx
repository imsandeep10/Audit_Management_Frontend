import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Download, 
  FileSpreadsheet, 
  Search,
  ChevronDown,
  ChevronRight,
  History,
  Building
} from 'lucide-react';
import { useGetAmountByCLientId } from '../../api/useclient';
import * as XLSX from 'xlsx';

interface MaskebariRecord {
  _id: string;
  maskebariDate: string;
  vatableSales: number;
  vatFreeSales: number;
  vatablePurchase: number;
  customPurchase: number;
  vatFreePurchase: number;
  creditRemainingBalance: number;
  createdAt: string;
  updatedAt: string;
  lastMaskebari?: MaskebariRecord[];
  companyName?: string;
  clientId?: string | {
    _id?: string;
    companyName?: string;
    [key: string]: any;
  };
  taskId?: string;
  IRDID?: string;
  IRDoffice?: string;
  OCRID?: string;
  VCTSID?: string;
  assignedEmployees?: any[];
  auditFees?: number;
  bills?: any[];
  clientNature?: string;
  clientType?: string;
  dateOfExciseRegistration?: string;
  dateOfTaxRegistration?: string;
  dateOfVatRegistration?: string;
  extraCharges?: number;
  fillingperiod?: string;
  indexFileNumber?: string;
  maskebariId?: string;
  registrationNumber?: string;
  user?: {
    _id?: string;
    fullName?: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    [key: string]: any;
  };
  __v?: number;
}

interface AmountData {
  message: string;
  clientId: string;
  totalRecords: number;
  maskebariRecords: MaskebariRecord[];
  [key: string]: any;
}

const MaskebariRecords: React.FC = () => {
  const { data, isLoading, isError } = useGetAmountByCLientId() as {
    data?: AmountData;
    isLoading: boolean;
    isError: boolean;
  };
  console.log(data)

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return 'NRs 0.00';
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('NPR', 'NRs');
  };

  

  const getCreditBalanceColor = (balance: number): string => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCompanyName = (record: MaskebariRecord): string => {
    if (typeof record.clientId === 'object' && record.clientId?.companyName) {
      return record.clientId.companyName;
    }
    return record.companyName || 'N/A';
  };

  const getClientId = (record: MaskebariRecord): string => {
    if (typeof record.clientId === 'object' && record.clientId?._id) {
      return record.clientId._id;
    }
    return typeof record.clientId === 'string' ? record.clientId : '';
  };

  // Process records to filter out duplicates and ensure proper company names
  const processedRecords = useMemo(() => {
    if (!data?.maskebariRecords) return [];
    
    const clientRecordsMap = new Map();
    
    data.maskebariRecords.forEach(record => {
      const clientId = getClientId(record);
      if (!clientId) return;
      
      if (!clientRecordsMap.has(clientId)) {
        clientRecordsMap.set(clientId, []);
      }
      clientRecordsMap.get(clientId).push(record);
    });
    
    const result: MaskebariRecord[] = [];
    
    clientRecordsMap.forEach((records: MaskebariRecord[]) => {
      records.sort((a: MaskebariRecord, b: MaskebariRecord) => 
        new Date(b.maskebariDate).getTime() - new Date(a.maskebariDate).getTime()
      );
      
      const latestRecord = {...records[0]};
      
      // Set historical records (excluding the latest)
      if (records.length > 1) {
        latestRecord.lastMaskebari = records.slice(1);
      }
      
      result.push(latestRecord);
    });
    
    return result;
  }, [data?.maskebariRecords]);

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!processedRecords.length) return [];
    
    if (!searchTerm.trim()) return processedRecords;

    const searchLower = searchTerm.toLowerCase();
    return processedRecords.filter(record => {
      const companyName = getCompanyName(record).toLowerCase();
      const date = (record.maskebariDate).toLowerCase().split('T')[0];
      const clientId = getClientId(record).toLowerCase();
      
      return companyName.includes(searchLower) || 
             date.includes(searchLower) || 
             clientId.includes(searchLower);
    });
  }, [processedRecords, searchTerm]);

  // Toggle expanded row
  const toggleRowExpansion = (recordId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRows(newExpanded);
  };

  // Export to Excel function
  const exportToExcel = (): void => {
    if (!filteredRecords.length) return;

    const exportData = filteredRecords.flatMap((record, index) => {
      const mainRecord = {
        'S.N.': index + 1,
        'Type': 'Current',
        'Date': (record.maskebariDate.split('T')[0]),
        'Company Name': getCompanyName(record),
        'Client ID': getClientId(record),
        'Vatable Sales (NRs)': record.vatableSales || 0,
        'VAT Free Sales (NRs)': record.vatFreeSales || 0,
        'Vatable Purchase (NRs)': record.vatablePurchase || 0,
        'Custom Purchase (NRs)': record.customPurchase || 0,
        'VAT Free Purchase (NRs)': record.vatFreePurchase || 0,
        'Credit Balance (NRs)': record.creditRemainingBalance || 0,
      };

      const historyRecords = (record.lastMaskebari || []).map((histRecord, histIndex) => ({
        'S.N.': `${index + 1}.${histIndex + 1}`,
        'Type': 'Historical',
        'Date': (histRecord.maskebariDate.split('T')[0]),
        'Company Name': getCompanyName(histRecord),
        'Client ID': getClientId(histRecord),
        'Vatable Sales (NRs)': histRecord.vatableSales || 0,
        'VAT Free Sales (NRs)': histRecord.vatFreeSales || 0,
        'Vatable Purchase (NRs)': histRecord.vatablePurchase || 0,
        'Custom Purchase (NRs)': histRecord.customPurchase || 0,
        'VAT Free Purchase (NRs)': histRecord.vatFreePurchase || 0,
        'Credit Balance (NRs)': histRecord.creditRemainingBalance || 0,
      }));

      return [mainRecord, ...historyRecords];
    });

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet['!cols'] = [
        { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Maskebari Records');
      
      const today = new Date().toISOString().split('T')[0];
      const filename = `Maskebari_Records_${today}.xlsx`;
      
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  const exportToCSV = (): void => {
    if (!filteredRecords.length) return;
    
    const csvData = [
      ['S.N.', 'Type', 'Date', 'Company Name', 'Client ID', 'Vatable Sales', 'VAT Free Sales', 
       'Vatable Purchase', 'Custom Purchase', 'VAT Free Purchase', 'Credit Balance']
    ];

    filteredRecords.forEach((record, index) => {
      // Add main record
      csvData.push([
        (index + 1).toString(),
        'Current',
        (record.maskebariDate.split('T')[0]),
        getCompanyName(record),
        getClientId(record),
        (record.vatableSales || 0).toString(),
        (record.vatFreeSales || 0).toString(),
        (record.vatablePurchase || 0).toString(),
        (record.customPurchase || 0).toString(),
        (record.vatFreePurchase || 0).toString(),
        (record.creditRemainingBalance || 0).toString(),
      ]);

      // Add historical records
      (record.lastMaskebari || []).forEach((histRecord, histIndex) => {
        csvData.push([
          `${index + 1}.${histIndex + 1}`,
          'Historical',
          (histRecord.maskebariDate.split('T')[0]),
          getCompanyName(histRecord),
          getClientId(histRecord),
          (histRecord.vatableSales || 0).toString(),
          (histRecord.vatFreeSales || 0).toString(),
          (histRecord.vatablePurchase || 0).toString(),
          (histRecord.customPurchase || 0).toString(),
          (histRecord.vatFreePurchase || 0).toString(),
          (histRecord.creditRemainingBalance || 0).toString(),
        ]);
      });
    });

    try {
      const csvContent = csvData.map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Maskebari_Records_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Maskebari Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Maskebari Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Failed to load maskebari records. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Maskebari Records
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="ml-2">
              {filteredRecords.length} of {processedRecords.length} Record{(processedRecords.length || 0) !== 1 ? 's' : ''}
            </Badge>
            {filteredRecords.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToExcel}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {processedRecords.length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Maskebari Records</h3>
            <p className="text-sm text-muted-foreground">
              No maskebari records have been created for this client yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-10">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by company name, date, or client ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detailed Records
                  {searchTerm && (
                    <Badge variant="secondary" className="ml-2">
                      Filtered: {filteredRecords.length} results
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold min-w-[50px]">
                          History
                        </TableHead>
                        <TableHead className="font-semibold min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Company Name
                          </div>
                        </TableHead>
                       
                        <TableHead className="font-semibold text-center min-w-[120px]">
                          <div className="text-green-700">
                            Vatable Sales
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-center min-w-[120px]">
                          <div className="text-green-700">
                            VAT Free Sales
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-center min-w-[120px]">
                          <div className="text-blue-700">
                            Vatable Purchase
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-center min-w-[120px]">
                          <div className="text-blue-700">
                            Custom Purchase
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-center min-w-[120px]">
                          <div className="text-blue-700">
                            VAT Free Purchase
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-center min-w-[150px]">
                          <div className="flex items-center justify-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit Balance
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record, index) => {
                        const hasHistory = record.lastMaskebari && record.lastMaskebari.length > 0;
                        const isExpanded = expandedRows.has(record._id);
                        
                        return (
                          <React.Fragment key={record._id}>
                            {/* Main Record Row */}
                            <TableRow 
                              className={`hover:bg-muted/30 transition-colors ${
                                index === 0 ? 'bg-yellow-50/30' : ''
                              }`}
                            >
                              <TableCell>
                                {hasHistory && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleRowExpansion(record._id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Badge variant="outline" className="text-xs">
                                      {record.lastMaskebari!.length}
                                    </Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{(record.maskebariDate.split('T')[0])}</span>
                                  {index === 0 && (
                                    <Badge variant="secondary" className="text-xs">Latest</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {getCompanyName(record)}
                                </span>
                              </TableCell>
                              
                              <TableCell className="text-center">
                                <span className="font-medium text-green-700">
                                  {(record.vatableSales || 0) < 0 ? '-' : ''}{formatCurrency(Math.abs(record.vatableSales || 0))}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium text-green-700">
                                  {(record.vatFreeSales || 0) < 0 ? '-' : ''}{formatCurrency(Math.abs(record.vatFreeSales || 0))}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium text-blue-700">
                                  {(record.vatablePurchase || 0) < 0 ? '-' : ''}{formatCurrency(Math.abs(record.vatablePurchase || 0))}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium text-blue-700">
                                  {(record.customPurchase || 0) < 0 ? '-' : ''}{formatCurrency(Math.abs(record.customPurchase || 0))}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium text-blue-700">
                                  {(record.vatFreePurchase || 0) < 0 ? '-' : ''}{formatCurrency(Math.abs(record.vatFreePurchase || 0))}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-semibold ${getCreditBalanceColor(record.creditRemainingBalance || 0)}`}>
                                  {(record.creditRemainingBalance || 0) < 0 ? '-' : ''}{formatCurrency(Math.abs(record.creditRemainingBalance || 0))}
                                </span>
                              </TableCell>
                            </TableRow>
                            
                            {/* Historical Records Dropdown Content */}
                            {hasHistory && isExpanded && (
                              <TableRow>
                                <TableCell colSpan={10} className="p-0">
                                  <div className="bg-blue-50/50 border-t border-blue-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <History className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-blue-800">Historical Records</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {record.lastMaskebari!.length} record{record.lastMaskebari!.length !== 1 ? 's' : ''}
                                      </Badge>
                                    </div>
                                    <div className="space-y-3">
                                      {record.lastMaskebari!.map((histRecord, histIndex) => (
                                        <div 
                                          key={`${record._id}-hist-${histIndex}`}
                                          className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm"
                                        >
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                              <span className="font-medium text-gray-600">Date:</span>
                                              <div className="text-blue-700 font-medium">
                                                {(histRecord.maskebariDate.split('T')[0])}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-600">Company:</span>
                                              <div className="text-blue-700 font-medium">
                                                {getCompanyName(histRecord)}
                                              </div>
                                            </div>
                                           
                                            <div>
                                              <span className="font-medium text-gray-600">Vatable Sales:</span>
                                              <div className="text-green-600 font-medium">
                                                {formatCurrency(histRecord.vatableSales || 0)}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-600">VAT Free Sales:</span>
                                              <div className="text-green-600 font-medium">
                                                {formatCurrency(histRecord.vatFreeSales || 0)}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-600">Vatable Purchase:</span>
                                              <div className="text-blue-600 font-medium">
                                                {formatCurrency(histRecord.vatablePurchase || 0)}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-600">Custom Purchase:</span>
                                              <div className="text-blue-600 font-medium">
                                                {formatCurrency(histRecord.customPurchase || 0)}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-600">VAT Free Purchase:</span>
                                              <div className="text-blue-600 font-medium">
                                                {formatCurrency(histRecord.vatFreePurchase || 0)}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-600">Credit Balance:</span>
                                              <div className={`font-semibold ${getCreditBalanceColor(histRecord.creditRemainingBalance || 0)}`}>
                                                {formatCurrency(histRecord.creditRemainingBalance || 0)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                      
                      {filteredRecords.length === 0 && searchTerm && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No records found matching "{searchTerm}"</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchTerm('')}
                              >
                                Clear Search
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaskebariRecords;