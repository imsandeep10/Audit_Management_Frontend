import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../contexts/SearchContext";
import type { documentPreviewProps } from "../create-client/document-manager";
import { toast } from "sonner";
import { DocumentPreview } from "../documentUpload/documentPreview";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { ChevronDown, Eye, FileText } from "lucide-react";

// Define types for search results
interface SearchItem {
  _id: string;
  id?: string;
  isMostRelevant?: boolean;
  // Document fields
  originalName?: string;
  documentURL?: string;
  fileSize?: number;
  // User fields
  fullName?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  // Client fields
  companyName?: string;
  registrationNumber?: string;
  address?: string;
  // Employee fields
  position?: string;
  // Task fields
  taskTitle?: string;
  description?: string;
  status?: string;
  dueDate?: string;
  // Bill fields
  billNo?: string;
  customerBillNo?: string;
  customerName?: string;
  customerPan?: string;
  billType?: string;
  documentType?: string;
  billDate?: string;
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
  documentIds?: Array<{
    _id: string;
    originalName?: string;
    documentURL?: string;
    fileSize?: number;
  }>;
  clientId?: {
    _id: string;
    companyName: string;
  };
  client?: {
    _id: string;
    companyName: string;
  };
  // Updated to include user info for clients and employees
  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
    phoneNumber?: string;
    isActive?: boolean;
    address?: string;
    DOB?: string;
    lastLogin?: string;
  };
  // Employee specific populated fields
  assignedClients?: Array<{
    _id: string;
    companyName: string;
    registrationNumber?: string;
  }>;
}

interface SearchData {
  documents?: SearchItem[];
  users?: SearchItem[];
  clients?: SearchItem[];
  employees?: SearchItem[];
  tasks?: SearchItem[];
  bills?: SearchItem[];
  [key: string]: SearchItem[] | undefined;
}

interface SearchResultProps {
  onResultClick?: () => void;
}

export default function SearchResult({ onResultClick }: SearchResultProps) {
  const { data, isFetching, error, debouncedTerm } = useSearch();
  const navigate = useNavigate();

  const [previewDocument, setPreviewDocument] = useState<documentPreviewProps | null>(null);

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!text || !searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-blue-200 px-1 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

const handleItemClick = (item: SearchItem, category: string) => {
  if (onResultClick) onResultClick();

  switch (category) {
    case "documents":
      if (item.documentURL) {
        window.open(item.documentURL, "_blank");
      }
      break;
    case "tasks":
      navigate(`/assignment`);
      break;
    case "clients":
      // Navigate to the client's user profile
      if (item.user?._id) {
        navigate(`/user-detail/${item.user._id}`, {
          state: {
            clientId: item._id,
            clientName: item.companyName,
          },
        });
      } else {
        toast.error("No user information available for this client");
      }
      break;
    case "employees":
      // Navigate to the employee's user profile
      if (item.user?._id) {
        navigate(`/user-detail/${item.user._id}`, {
          state: {
            employeeId: item._id,
            employeePosition: item.position,
          },
        });
      } else {
        // Fallback to employee ID if user info not available
        navigate(`/employees/${item._id}`);
      }
      break;
    case "users":
      switch (item.role?.toLowerCase()) {
        case "admin":
          navigate(`/profile`);
          break;
        case "employee":
          navigate(`/user-detail/${item._id}`);
          break;
        case "client":
          navigate(`/user-detail/${item._id}`, {
            state: {
              clientId: item.client?._id || item.clientId?._id,
              clientName:
                item.client?.companyName || item.clientId?.companyName,
            },
          });
          break;
        default:
          navigate(`/profile`);
          break;
      }
      break;
    default:
      break;
  }
};

  if (isFetching)
    return <p className="p-4 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error fetching results</p>;

  if (!data) return <p className="p-4">No results found</p>;
  const searchData = data as SearchData;

  // Define how each type of data should be displayed
  const renderItemContent = (item: SearchItem, category: string) => {
    switch (category) {
      case "documents":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {highlightSearchTerm(item.originalName || "", debouncedTerm)}
            </span>
            <span className="text-sm text-gray-500">{item.documentType}</span>
          </div>
        );
      case "users":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {highlightSearchTerm(item.fullName || "", debouncedTerm)}
            </span>
            <span className="text-sm text-gray-500">
              {highlightSearchTerm(item.email || "", debouncedTerm)}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {item.role}
            </span>
          </div>
        );
      case "clients":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {highlightSearchTerm(item.companyName || "", debouncedTerm)}
            </span>
            {item.registrationNumber && (
              <span className="text-sm text-gray-500">
                Reg:{" "}
                {highlightSearchTerm(item.registrationNumber, debouncedTerm)}
              </span>
            )}
            {item.address && (
              <span className="text-sm text-gray-500">
                {highlightSearchTerm(item.address, debouncedTerm)}
              </span>
            )}
            {/* Display user information */}
            {item.user && (
              <div className="mt-1 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                <span className="text-sm font-medium text-blue-800">
                  Contact: {highlightSearchTerm(item.user.fullName || "", debouncedTerm)}
                </span>
                <div className="text-xs text-blue-600">
                  {highlightSearchTerm(item.user.email || "", debouncedTerm)}
                </div>
                {item.user.phoneNumber && (
                  <div className="text-xs text-blue-600">
                    {highlightSearchTerm(item.user.phoneNumber, debouncedTerm)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "employees":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {highlightSearchTerm(item.user?.fullName || item.fullName || "", debouncedTerm)}
            </span>
            {item.position && (
              <span className="text-sm text-gray-500">
                Position: {highlightSearchTerm(item.position, debouncedTerm)}
              </span>
            )}
            {(item.user?.phoneNumber || item.phoneNumber) && (
              <span className="text-sm text-gray-500">
                Phone: {highlightSearchTerm(item.user?.phoneNumber || item.phoneNumber || "", debouncedTerm)}
              </span>
            )}
            {/* Display user information */}
            {item.user && (
              <div className="mt-1 p-2 bg-green-50 rounded border-l-2 border-green-300">
                <div className="text-xs text-green-600">
                  {highlightSearchTerm(item.user.email || "", debouncedTerm)}
                </div>
                {item.user.address && (
                  <div className="text-xs text-green-600">
                    Address: {highlightSearchTerm(item.user.address, debouncedTerm)}
                  </div>
                )}
              </div>
            )}
            {/* Display assigned clients */}
            {item.assignedClients && item.assignedClients.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Assigned to: {item.assignedClients.map(client => client.companyName).join(", ")}
              </div>
            )}
          </div>
        );
      case "tasks":
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {highlightSearchTerm(item.taskTitle || "", debouncedTerm)}
            </span>
            {item.description && (
              <span className="text-sm text-gray-500 truncate">
                {highlightSearchTerm(
                  item.description.substring(0, 50) + "...",
                  debouncedTerm
                )}
              </span>
            )}
            <span className="text-sm text-gray-500 capitalize">
              Status: {item.status}
            </span>
            {item.dueDate && (
              <span className="text-sm text-gray-500">
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      case "bills":
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">
                {highlightSearchTerm(
                  item.billType === "sales"
                    ? item.billNo || ""
                    : item.customerBillNo || "",
                  debouncedTerm
                )}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {item.billType?.toUpperCase()} -{" "}
                {item.documentType?.toUpperCase()}
              </span>
              {item.documentIds && item.documentIds.length > 0 && (
                item.documentIds.length === 1 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBillPreview(item);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs px-2 py-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview ({item.documentIds.length})
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {item.documentIds.map((doc, index) => (
                        <DropdownMenuItem
                          key={doc._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpecificDocumentPreview(doc, item.documentType || 'unknown');
                          }}
                          className="flex items-start gap-2 p-2"
                        >
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {doc.originalName || `Document ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              )}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              Customer:{" "}
              {highlightSearchTerm(item.customerName || "", debouncedTerm)}
            </span>
            {item.clientId?.companyName && (
              <span className="text-sm text-gray-500">
                Client: {item.clientId.companyName}
              </span>
            )}
            {item.userId && (
              <span className="text-sm text-gray-500">
                User:{" "}
                {highlightSearchTerm(
                  item.userId.fullName || item.userId.email || "",
                  debouncedTerm
                )}{" "}
                ({item.userId.role})
              </span>
            )}
            {item.customerPan && (
              <span className="text-sm text-gray-500">
                PAN: {highlightSearchTerm(item.customerPan, debouncedTerm)}
              </span>
            )}
            {item.billDate && (
              <span className="text-sm text-gray-500">
                Date: {new Date(item.billDate).toLocaleDateString()}
              </span>
            )}
            {item.documentIds && (
              <span className="text-sm text-gray-500">
                Documents: {item.documentIds.length}
              </span>
            )}
          </div>
        );
      default:
        return (
          <p>
            {highlightSearchTerm(
              item.originalName ||
                item.fullName ||
                item.companyName ||
                "Unnamed Item",
              debouncedTerm
            )}
          </p>
        );
    }
  };

  // Check if there are any results
  const hasResults = Object.values(searchData).some(
    (items) => Array.isArray(items) && items.length > 0
  );

  if (!hasResults) {
    return <p className="p-4 text-center text-gray-500">No results found</p>;
  }

  const handleBillPreview = (bill: SearchItem) => {
    // If bill has documents, preview the first document
    if (bill.documentIds && bill.documentIds.length > 0) {
      const firstDocument = bill.documentIds[0];
      setPreviewDocument({
        id: firstDocument._id,
        originalName: firstDocument.originalName || 'Unknown Document',
        url: firstDocument.documentURL || '',
        documentType: bill.documentType || 'unknown',
        size: firstDocument.fileSize || 0,
      });
    } else {
      toast.error('No documents available for this bill');
    }
  };

  const handleSpecificDocumentPreview = (document: { _id: string; originalName?: string; documentURL?: string; fileSize?: number }, billDocumentType: string) => {
    setPreviewDocument({
      id: document._id,
      originalName: document.originalName || 'Unknown Document',
      url: document.documentURL || '',
      documentType: billDocumentType,
      size: document.fileSize || 0,
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-md p-4 overflow-y-auto max-w-7xl max-h-[70vh]">
      <DocumentPreview
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
      {Object.entries(searchData)
        .sort(([, itemsA], [, itemsB]) => {
          // Sort categories with most relevant items first
          const aMostRelevant =
            Array.isArray(itemsA) &&
            itemsA.some((item: SearchItem) => item.isMostRelevant);
          const bMostRelevant =
            Array.isArray(itemsB) &&
            itemsB.some((item: SearchItem) => item.isMostRelevant);

          if (aMostRelevant && !bMostRelevant) return -1;
          if (!aMostRelevant && bMostRelevant) return 1;
          return 0;
        })
        .map(([category, items]) => {
          if (!Array.isArray(items) || items.length === 0) return null;

          // Sort items within each category - most relevant first
          const sortedItems = [...items].sort(
            (a: SearchItem, b: SearchItem) => {
              if (a.isMostRelevant && !b.isMostRelevant) return -1;
              if (!a.isMostRelevant && b.isMostRelevant) return 1;
              return 0;
            }
          );

          // Format category name for display
          const formattedCategory = category
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();

          // Check if this category has the most relevant item
          const hasMostRelevant = sortedItems.some(
            (item: SearchItem) => item.isMostRelevant
          );

          return (
            <div key={category} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold capitalize sticky top-0 py-2 px-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  {formattedCategory} ({sortedItems.length})
                </h2>
                {hasMostRelevant && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                    ⭐ Best Match Here
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {sortedItems.map((item: SearchItem) => (
                  <li
                    key={item._id || item.id}
                    className={`p-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border ${
                      item.isMostRelevant
                        ? "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 ring-2 ring-yellow-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => handleItemClick(item, category)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {item.isMostRelevant && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              ⭐ Most Relevant
                            </span>
                          </div>
                        )}
                        {renderItemContent(item, category)}
                      </div>
                      <div className="text-gray-400 ml-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}