import { useState } from 'react';
import { useClientDocuments, useDeleteDocument } from '../../hooks/client-document';
import { useDeleteBill } from '../../api/useBills';
import { useAuth } from '../../hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  File,
  Filter,
  MoreVertical,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { formatBytes, formatDate } from '../../utils/date-format';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from "sonner"
import { DocumentPreview } from '../documentUpload/documentPreview';
import NepaliDate from 'nepali-date-converter';


interface DocumentManagerProps {
  clientId: string;
  userType?: 'admin' | 'employee';
}

export interface documentPreviewProps {
  id: string;
  originalName: string;
  url: string;
  documentType: string;
  size: number;
}


type ViewType = 'documents' | 'bills' ;

// Define our document types explicitly
const DOCUMENT_TYPES = ['registration', 'tax_clearance', 'audit_report', 'pan', 'vat', 'other'] as const;
type DocumentType = typeof DOCUMENT_TYPES[number];

// Define Nepali months
const NEPALI_MONTHS = [
  { value: 'all', label: 'All Months' },
  { value: '1', label: 'Baisakh (बैशाख)' },
  { value: '2', label: 'Jestha (जेष्ठ)' },
  { value: '3', label: 'Ashadh (आषाढ)' },
  { value: '4', label: 'Shrawan (श्रावण)' },
  { value: '5', label: 'Bhadra (भाद्र)' },
  { value: '6', label: 'Ashwin (आश्विन)' },
  { value: '7', label: 'Kartik (कार्तिक)' },
  { value: '8', label: 'Mangsir (मंसिर)' },
  { value: '9', label: 'Poush (पौष)' },
  { value: '10', label: 'Magh (माघ)' },
  { value: '11', label: 'Falgun (फाल्गुन)' },
  { value: '12', label: 'Chaitra (चैत्र)' }
] as const;

// Helper function to get current Nepali month
const getCurrentNepaliMonth = () => {
  try {
    const nepaliDate = new NepaliDate();
    return (nepaliDate.getMonth() + 1).toString();
  } catch (error) {
    console.error('Error getting current Nepali month:', error);
    return '1'; // Default to Baisakh
  }
};

export function DocumentManager({ clientId, userType }: DocumentManagerProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentType | 'all'>('all');
  const [billDocumentTypeFilter, setBillDocumentTypeFilter] = useState<'all' | 'pan' | 'vat'>('all');
  const [nepaliMonthFilter, setNepaliMonthFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 10;
  const location = useLocation();
  const { userName, clientName, clientId: stateClientId, companyName } = location.state || {};
  const navigate = useNavigate();

  // Use the clientId from props first, then from state as fallback
  const resolvedClientId = clientId || stateClientId;
  const resolvedClientName = clientName || userName;
  const resolvedCompanyName = companyName || '';

  // Determine the actual user type - use passed userType or derive from auth context
  const actualUserType = userType || user?.role || 'admin';

  const [previewDocument, setPreviewDocument] = useState<documentPreviewProps | null>(null);


  const { data, isLoading, isError, error } = useClientDocuments(clientId, {
    page,
    limit,
    documentType: documentTypeFilter !== 'all' ? documentTypeFilter : undefined,
    search: searchTerm,
    sortBy,
    sortOrder,
    nepaliMonth: nepaliMonthFilter !== 'all' ? nepaliMonthFilter : undefined,
  });

  const deleteDocumentMutation = useDeleteDocument(clientId);
  const deleteBillMutation = useDeleteBill();

  const handleDelete = async (documentId: string, documentName: string) => {
    try {
      await deleteDocumentMutation.mutateAsync(documentId);
      toast.success(`Document "${documentName}" deleted successfully.`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Unknown error';
      const isAccessError = errorMessage.includes('assigned') || errorMessage.includes('access') || err?.response?.status === 403;

      if (isAccessError) {
        toast.error('You can only delete documents for clients assigned to you.');
      } else {
        toast.error(`There was an error deleting the document: ${errorMessage}`);
      }
    }
  };

  const handleBillDelete = async (billId: string, billInfo: { billType: string; customerName: string }) => {
    try {
      await deleteBillMutation.mutateAsync(billId);
      toast.success(`${billInfo.billType.charAt(0).toUpperCase() + billInfo.billType.slice(1)} bill for "${billInfo.customerName}" deleted successfully.`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Unknown error';
      const isAccessError = errorMessage.includes('assigned') || errorMessage.includes('access') || err?.response?.status === 403;

      if (isAccessError) {
        toast.error('You can only delete bills for clients assigned to you.');
      } else {
        toast.error(`There was an error deleting the bill: ${errorMessage}`);
      }
    }
  };

  const handleBillPreview = (bill: any) => {
    // If bill has documents, preview the first document
    if (bill.documents && bill.documents.length > 0) {
      const firstDocument = bill.documents[0];
      setPreviewDocument({
        id: firstDocument.id,
        originalName: firstDocument.originalName,
        url: firstDocument.url,
        documentType: firstDocument.documentType,
        size: firstDocument.size || 0,
      });
    } else {
      toast.error('No documents available for this bill');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDocumentTypeFilter('all');
    setBillDocumentTypeFilter('all');
    setNepaliMonthFilter('all');
    setSortBy('uploadDate');
    setSortOrder('desc');
    setPage(1);
  };

  const getYearOptions = () => {
    if (!data?.documents) return [];

    const years = new Set<number>();
    data.documents.forEach(doc => {
      const year = new Date(doc.uploadDate).getFullYear();
      years.add(year);
    });

    return Array.from(years).sort((a, b) => b - a);
  };

  const renderBillsTable = () => {
    const selectedMonthName = nepaliMonthFilter !== 'all'
      ? NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'
      : '';

    if (!data?.bills?.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {nepaliMonthFilter !== 'all'
            ? `No bills found for this client in ${selectedMonthName}.`
            : "No bills found for this client."
          }
        </div>
      );
    }

    // Filter bills based on document type
    const filteredBills = data.bills.filter(bill => {
      if (billDocumentTypeFilter === 'all') return true;
      return bill.documentType === billDocumentTypeFilter;
    });

    if (filteredBills.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {nepaliMonthFilter !== 'all'
            ? `No ${billDocumentTypeFilter !== 'all' ? billDocumentTypeFilter.toUpperCase() + ' ' : ''}bills found in ${selectedMonthName}.`
            : `No ${billDocumentTypeFilter !== 'all' ? billDocumentTypeFilter.toUpperCase() + ' ' : ''}bills found.`
          }
        </div>
      );
    }

    // Separate sales and purchase bills
    const salesBills = filteredBills.filter(bill => bill.billType === 'sales');
    const purchaseBills = filteredBills.filter(bill => bill.billType === 'purchase');

    return (
      <div className="space-y-6">
        {/* Amount Section */}
        {/* Sales Bills Section */}
        {salesBills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Sales Bills
              </Badge>
              <span>({salesBills.length})</span>
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Registration Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.billNo}</TableCell>
                    <TableCell>{bill.customerName}</TableCell>
                    <TableCell>{bill.customerPan || 'N/A'}</TableCell>
                    <TableCell>
                      {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {bill.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase">
                        {bill.registrationType || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {bill.amount ? `NRs ${bill.amount.toLocaleString()}` : 'NRs 0'}
                    </TableCell>
                    <TableCell>
                      {bill.documents?.length > 0 ? (
                        <div className="space-y-1">
                          {bill.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                            >
                              <File className="h-3 w-3" />
                              {doc.originalName}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No attachments</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleBillPreview(bill)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          {userType === 'admin' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleBillDelete(bill.id, { billType: bill.billType, customerName: bill.customerName })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Purchase Bills Section */}
        {purchaseBills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Purchase Bills
              </Badge>
              <span>({purchaseBills.length})</span>
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Bill No</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Registration Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.customerBillNo}</TableCell>
                    <TableCell>{bill.customerName}</TableCell>
                    <TableCell>{bill.customerPan || 'N/A'}</TableCell>
                    <TableCell>
                      {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {bill.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase">
                        {bill.registrationType || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {bill.amount ? `NRs ${bill.amount.toLocaleString()}` : 'NRs 0'}
                    </TableCell>
                    <TableCell>
                      {bill.documents?.length > 0 ? (
                        <div className="space-y-1">
                          {bill.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                            >
                              <File className="h-3 w-3" />
                              {doc.originalName}
                            </a>
                          ))}

                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No attachments</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleBillPreview(bill)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          {userType === 'admin' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleBillDelete(bill.id, { billType: bill.billType, customerName: bill.customerName })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  };

  const formatDocumentType = (type: string) => {
    return type.split('_')
      .map(word => {
        if (word === 'pan') return 'PAN';
        if (word === 'vat') return 'VAT';
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  if (isError) {
    // Check if it's an access permission error
    const errorMessage = error?.message || 'Unknown error';
    const isAccessError = errorMessage.includes('assigned') || errorMessage.includes('access') || errorMessage.includes('403');

    return (
      <div className="p-6 text-center">
        <div className={`p-4 rounded-md ${isAccessError ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`}>
          <h3 className="font-medium mb-2">
            {isAccessError ? 'Access Restricted' : 'Error Loading Documents'}
          </h3>
          <p className="text-sm">
            {isAccessError
              ? 'You can only access documents for clients assigned to you. Please contact your administrator if you believe this is an error.'
              : `Error loading documents: ${errorMessage}`
            }
          </p>
        </div>
      </div>
    );
  }

  // function to preview the document
  const handlePreview = (document: {
    id: string;
    originalName: string;
    url: string;
    documentType: string;
    size: number;
  }) => {
    setPreviewDocument(document);
  };



  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 overflow-y-auto" style={{ maxHeight: '90vh' }}>
      <DocumentPreview
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
        <div className='flex items-center justify-between gap-4'>

          <div className='space-y-1' >
            <h2 className="text-2xl font-bold">Documents of Client {resolvedClientName || 'Unknown'}</h2>
            <p className='font-medium text-md'>Company name: <span className='font-semibold text-md'>{resolvedCompanyName}</span> </p>
          </div>
 
          <div className='flex items-center space-x-2'>
            <Button
              variant="secondary"
              className='whitespace-nowrap cursor-pointer'
              onClick={() => {
                const billsPath = actualUserType === 'employee'
                  ? `/employee/clients/${resolvedClientId}/upload-client-bills`
                  : `/clients/${resolvedClientId}/upload-client-bills`;

                navigate(billsPath, {
                  state: {
                    clientId: resolvedClientId,
                    clientName: resolvedClientName,
                    userType: actualUserType,
                    companyName: resolvedCompanyName
                  }
                });
              }}
            >
              Upload Bills
            </Button>
            <Button variant="secondary"
              className='whitespace-nowrap cursor-pointer'
              onClick={() => {
                const documentsPath = actualUserType === 'employee'
                  ? `/employee/upload-client-documents/${clientId}`
                  : `/upload-client-documents/${clientId}`;

                navigate(documentsPath, {
                  state: {
                    clientId: clientId,
                    clientName: resolvedClientName,
                    userType: actualUserType,
                    companyName: resolvedCompanyName
                  }
                });
              }}
            >
              Upload Document
            </Button>
          </div>
        {data && (
          <div className="text-sm text-muted-foreground">
            {currentView === 'documents'
              ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, data.pagination.totalDocuments)} of ${data.pagination.totalDocuments} documents`
              : `Showing ${data.bills?.length || 0} bills`
            }
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data?.pagination?.totalDocuments || 0}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data?.bills?.length || 0}</div>
            <div className="text-sm text-muted-foreground">
              Total Bills{nepaliMonthFilter !== 'all' ? ` (${NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'})` : ''}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data?.bills?.filter(bill => bill.billType === 'sales').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Sales Bills{nepaliMonthFilter !== 'all' ? ` (${NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'})` : ''}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {data?.bills?.filter(bill => bill.billType === 'purchase').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Purchase Bills{nepaliMonthFilter !== 'all' ? ` (${NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'})` : ''}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              NRs {data?.billAmountStats?.salesTotal?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">
              Sales Total{nepaliMonthFilter !== 'all' ? ` (${NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'})` : ''}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              NRs {data?.billAmountStats?.purchaseTotal?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">
              Purchase Total{nepaliMonthFilter !== 'all' ? ` (${NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'})` : ''}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex border rounded-md p-1 bg-muted w-fit">
        <Button
          variant={currentView === 'documents' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('documents')}
          className="flex-1"
        >
          <File className="h-4 w-4 mr-2" />
          Documents ({data?.pagination?.totalDocuments || 0})
        </Button>
        <Button
          variant={currentView === 'bills' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentView('bills')}
          className="flex-1"
        >
          <File className="h-4 w-4 mr-2" />
          Bills ({data?.bills?.length || 0})
        </Button>
     
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={currentView === 'documents' ? "Search documents..." : "Search bills..."}
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {currentView === 'documents' ? (
                  <Select
                    value={documentTypeFilter}
                    onValueChange={(value) => {
                      setDocumentTypeFilter(value as DocumentType | 'all');
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatDocumentType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={billDocumentTypeFilter}
                    onValueChange={(value) => {
                      setBillDocumentTypeFilter(value as 'all' | 'pan' | 'vat');
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All bill types</SelectItem>
                      <SelectItem value="pan">PAN Bills</SelectItem>
                      <SelectItem value="vat">VAT Bills</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Nepali Month Filter - Available for both documents and bills */}
                <Select
                  value={nepaliMonthFilter}
                  onValueChange={(value) => {
                    setNepaliMonthFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by month" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {NEPALI_MONTHS.map((month) => {
                      const isCurrentMonth = month.value !== 'all' && month.value === getCurrentNepaliMonth();
                      return (
                        <SelectItem key={month.value} value={month.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{month.label}</span>
                            {isCurrentMonth && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select
                  value={`${sortBy}:${sortOrder}`}
                  onValueChange={(value) => {
                    const [newSortBy, newSortOrder] = value.split(':');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploadDate:desc">Newest first</SelectItem>
                    <SelectItem value="uploadDate:asc">Oldest first</SelectItem>
                    <SelectItem value="originalName:asc">Name (A-Z)</SelectItem>
                    <SelectItem value="originalName:desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || documentTypeFilter !== 'all' || billDocumentTypeFilter !== 'all' || nepaliMonthFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Document type stats */}
          {currentView === 'documents' && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={documentTypeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDocumentTypeFilter('all')}
              >
                All
              </Button>
              {DOCUMENT_TYPES.map((type) => {
                // const count = data?.documentTypeStats?.find(stat => stat._id === type)?.count || 0;
                return (
                  <Button
                    key={type}
                    variant={documentTypeFilter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDocumentTypeFilter(type)}
                  >
                    {formatDocumentType(type)}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year filter */}
      {currentView === 'documents' && getYearOptions().length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getYearOptions().map((year) => (
            <Badge
              key={year}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
            >
              {year}
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      {currentView === 'documents' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <span>Client Documents</span>
              {resolvedClientName && (
                <span className="text-sm font-normal text-muted-foreground">
                  of <span className="font-medium">{resolvedClientName}</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.documents?.length ? (
                  data.documents.map((document) => (
                    <TableRow key={document.id} onClick={() => handlePreview(document)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span
                            className="hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(document);
                            }}
                          >
                            {document.originalName}
                          </span>
                        </div>
                        {document.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {document.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatDocumentType(document.documentType)}</Badge>
                      </TableCell>
                      <TableCell>{formatBytes(document.size)}</TableCell>
                      <TableCell>
                        <div>{formatDate(document.uploadDate)}</div>
                        <div className="text-sm text-muted-foreground">
                          {document.uploadDateFormatted}
                        </div>
                      </TableCell>
                      <TableCell>
                        {document.uploadedBy ? (
                          <div>
                            <div>{document.uploadedBy.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {document.uploadedBy.role}
                            </div>
                          </div>
                        ) : (
                          'System'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handlePreview(document)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            {userName && userType === 'admin' && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(document.id, document.originalName)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {nepaliMonthFilter !== 'all'
                        ? `No documents found in ${NEPALI_MONTHS.find(m => m.value === nepaliMonthFilter)?.label || 'Selected Month'}.`
                        : "No documents found"
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4 scroll-pb-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <span>Page</span>
                  <span className="font-medium">{page}</span>
                  <span>of</span>
                  <span className="font-medium">{data.pagination.totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : currentView === 'bills' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <span>Client Bills</span>
              {resolvedClientName && (
                <span className="text-sm font-normal text-muted-foreground">
                  of <span className="font-medium">{resolvedClientName}</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderBillsTable()}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              <span>Client Amounts</span>
              {resolvedClientName && (
                <span className="text-sm font-normal text-muted-foreground">
                  of <span className="font-medium">{resolvedClientName}</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      )}
    </div>
  );
}