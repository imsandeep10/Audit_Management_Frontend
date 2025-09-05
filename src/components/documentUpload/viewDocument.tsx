import { useState } from 'react';
import { useDocuments, documentTypes, billTypes, documentCategories } from '../../hooks/document';
import axiosInstance from '../../api/axiosInstance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Search, Download, X, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/date-format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { DocumentPreview } from './documentPreview';
import { toast } from 'sonner';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to format document type
const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to shorten document name
const shortenDocumentName = (name: string, maxLength: number = 40): string => {
  if (name.length <= maxLength) return name;
  
  const extension = name.split('.').pop();
  const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
  const shortenedName = nameWithoutExt.substring(0, maxLength - 3 - (extension?.length || 0));
  
  return `${shortenedName}...${extension ? `.${extension}` : ''}`;
};

// Helper function to get bill type badge variant
const getBillTypeBadgeVariant = (billType: string) => {
  switch (billType) {
    case 'sales':
      return 'default';
    case 'purchase':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Helper function to get document category badge variant
const getDocumentCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'pan':
      return 'destructive';
    case 'vat':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Helper function to format bill information
const formatBillInfo = (bills: any[]) => {
  if (!bills || bills.length === 0) return null;
  
  const bill = bills[0]; // Take the first bill for display
  return {
    billType: bill.billType,
    documentType: bill.documentType,
    customerName: bill.customerName,
    customerPan: bill.customerPan,
    billNumber: bill.billType === 'sales' ? bill.billNo : bill.customerBillNo,
    billDate: bill.billDate,
  };
};

export function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    originalName: string;
    url: string;
    documentType: string;
    size: number;
  } | null>(null);
  const [filters, setFilters] = useState({
    documentType: 'all',
    billType: 'all',
    documentCategory: 'all',
    status: 'active',
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useDocuments({
    documentType: filters.documentType !== 'all' ? filters.documentType : undefined,
    billType: filters.billType !== 'all' ? filters.billType : undefined,
    documentCategory: filters.documentCategory !== 'all' ? filters.documentCategory : undefined,
    status: filters.status,
    page: filters.page,
    limit: filters.limit,
    search: searchTerm || undefined, 
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger refetch by changing filters
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // Trigger refetch immediately when clearing search
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handlePrevPage = () => {
    if (data?.pagination.hasPrevPage) {
      handleFilterChange('page', filters.page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNextPage) {
      handleFilterChange('page', filters.page + 1);
    }
  };

  const handlePreview = (doc: any) => {
    setPreviewDocument({
      id: doc.id,
      originalName: doc.originalName,
      url: doc.url,
      documentType: formatDocumentType(doc.documentType),
      size: doc.size,
    });
  };

  const handleDownload = (doc: any) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.originalName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading ${doc.originalName}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
      // Fallback to opening in new tab
      window.open(doc.url, '_blank');
    }
  };

  const handleDelete = async (doc: any) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.originalName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingDocId(doc.id);
      toast.loading('Deleting document...', { id: 'delete-toast' });
      
      const response = await axiosInstance.delete(`/files/documents/delete/${doc.id}`);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Document deleted successfully', { id: 'delete-toast' });
        // Refetch the documents to update the list
        refetch();
      } else {
        toast.error(response.data.message || 'Failed to delete document', { id: 'delete-toast' });
      }
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete document', { id: 'delete-toast' });
    } finally {
      setDeletingDocId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col py-4 px-6 h-full">

      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />

      {/* Search and Filters */}
      <div className="mb-6 bg-card p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by document name, client, customer, PAN, bill number..."
                className="pl-10 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <Select
                value={filters.documentType}
                onValueChange={(value) => handleFilterChange('documentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bill Type</label>
              <Select
                value={filters.billType}
                onValueChange={(value) => handleFilterChange('billType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bill type" />
                </SelectTrigger>
                <SelectContent>
                  {billTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Document Category</label>
              <Select
                value={filters.documentCategory}
                onValueChange={(value) => handleFilterChange('documentCategory', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </div>

      {/* Documents Table */}
      <div className="flex-1 overflow-auto">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="min-w-[200px]">Document Name</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
                  <TableHead className="min-w-[150px]">Client</TableHead>
                  <TableHead className="min-w-[200px]">Bill Information</TableHead>
                  <TableHead className="min-w-[150px]">Customer Details</TableHead>
                  <TableHead className="min-w-[120px]">Uploaded By</TableHead>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[80px]">Size</TableHead>
                  <TableHead className="min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-destructive">
                    Failed to load documents
                  </TableCell>
                </TableRow>
              ) : data?.documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                data?.documents.map((doc) => {
                  const billInfo = formatBillInfo(doc.bills || []);
                  return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        title={doc.originalName} 
                      >
                        {shortenDocumentName(doc.originalName)}
                      </a>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {formatDocumentType(doc.documentType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.client ? (
                        <>
                          <p className="font-medium">{doc.client.companyName}</p>
                          {doc.client.contactPerson?.name && (
                            <p className="text-sm text-muted-foreground">
                              {doc.client.contactPerson.name}
                            </p>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {billInfo ? (
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <Badge 
                              variant={getBillTypeBadgeVariant(billInfo.billType)}
                              className="text-xs"
                            >
                              {billInfo.billType === 'sales' ? 'Sales' : 'Purchase'}
                            </Badge>
                            <Badge 
                              variant={getDocumentCategoryBadgeVariant(billInfo.documentType)}
                              className="text-xs"
                            >
                              {billInfo.documentType?.toUpperCase()}
                            </Badge>
                          </div>
                          {billInfo.billNumber && (
                            <p className="text-sm">
                              <span className="font-medium">Bill No:</span> {billInfo.billNumber}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {(billInfo.billDate.split('T')[0])}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {billInfo ? (
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{billInfo.customerName}</p>
                          {billInfo.customerPan && (
                            <p className="text-xs">
                              <span className="font-medium">PAN:</span> {billInfo.customerPan}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {doc.uploadedBy ? (
                        <>
                          <p className="font-medium">{doc.uploadedBy.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {doc.uploadedBy.role}
                          </p>
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handlePreview(doc)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(doc)}
                            className="cursor-pointer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc)}
                            disabled={deletingDocId === doc.id}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingDocId === doc.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {data && data.documents.length > 0 && (
        <div className="mt-4 py-2 bg-background sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page {data.pagination.currentPage} of {data.pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!data.pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!data.pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Total {data.pagination.totalDocuments} documents
            </div>
          </div>
        </div>
      )}
    </div>
  );
}