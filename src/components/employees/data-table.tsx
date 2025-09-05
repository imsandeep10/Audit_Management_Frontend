import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { TooltipProvider } from "../ui/tooltip";

import type { DataTableProps } from "../../lib/types";
import { useSearchParams } from "react-router-dom";

export function DataTable<TData, TValue>({
  columns,
  data,
  totalPages,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [params, setParams] = useSearchParams();

  // Initialize pagination state from URL params
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: params.get("page") ? parseInt(params.get("page") || "0") : 0,
    pageSize: 5,
  });

  // Sync pagination with URL params when they change
  useEffect(() => {
    const pageFromUrl = params.get("page")
      ? parseInt(params.get("page") || "0")
      : 0;
    if (pageFromUrl !== pagination.pageIndex) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: pageFromUrl,
      }));
    }
  }, [params, pagination.pageIndex]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      setPagination((prev) => {
        const newPagination =
          typeof updater === "function" ? updater(prev) : updater;
        // Update URL when pagination changes
        setParams({ page: newPagination.pageIndex.toString() });
        return newPagination;
      });
    },
    state: {
      columnFilters,
      pagination,
    },
    // Disable client-side pagination since we're doing server-side
    manualPagination: true,
    pageCount: totalPages,
  });

  const totalItems = data.length;
  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalItems
  );

  // Generate page numbers for pagination
  const getVisiblePages = () => {
    const currentPage = pagination.pageIndex + 1;
    const delta = 2; // Number of pages to show on each side of current page

    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    // Adjust if we're near the beginning or end
    if (end - start < delta * 2) {
      if (start === 1) {
        end = Math.min(totalPages, start + delta * 2);
      } else if (end === totalPages) {
        start = Math.max(1, end - delta * 2);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handlePageChange = (newPageIndex: number) => {
    // Ensure the page index is within valid bounds
    if (newPageIndex >= 0 && newPageIndex < totalPages) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: newPageIndex,
      }));
      setParams({ page: newPageIndex.toString() });
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full h-full bg-gray-50 p-4 sm:p-6">
        {/* Header Section */}

        {/* Table Container - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-auto">
            <Table className="w-full min-w-[800px]">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-gray-200"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="font-semibold text-gray-900 bg-gray-50 px-4 py-4 text-left border-b border-gray-200 text-sm"
                          style={{ minWidth: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 bg-white"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-4 text-gray-900 text-sm"
                          style={{ minWidth: cell.column.getSize() }}
                        >
                          <div className="truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
          <div className="text-sm text-gray-700 order-2 sm:order-1">
            Showing {startItem} to {endItem} of {totalItems} employees
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
              className="text-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 h-8 w-8 p-0"
            >
              &lt;
            </Button>

            <div className="flex items-center space-x-1">
              {getVisiblePages().map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={
                    pagination.pageIndex === pageNumber - 1
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className={`h-8 w-8 p-0 text-sm ${
                    pagination.pageIndex === pageNumber - 1
                      ? "bg-[#210EAB] text-white hover:bg-[#210EAB]/90"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handlePageChange(pageNumber - 1)}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.pageIndex + 1)}
              disabled={!table.getCanNextPage()}
              className="text-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 h-8 w-8 p-0"
            >
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
