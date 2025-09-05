import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Plus,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  File,
  Download,
} from "lucide-react";
import { useBulkUploadMutation } from "../../api/useclient";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface UploadResult {
  success: boolean;
  message: string;
  summary?: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    successfulRegistrations: number;
    duplicates: number;
    errors: number;
  };
  details?: {
    parseErrors: string[];
    successful: Array<{
      row: number;
      email: string;
      fullName: string;
    }>;
    duplicates: Array<{
      row: number;
      email: string;
      message: string;
    }>;
    registrationErrors: Array<{
      row: number;
      email: string;
      error: string;
    }>;
  };
}

interface BulkClientUploadProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const BulkClientUpload: React.FC<BulkClientUploadProps> = ({
  trigger,
  onSuccess,
}) => {
  const { uploadClientsMutation } = useBulkUploadMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/)
    ) {
      toast.error("Invalid file type", {
        description: "Please select an Excel file (.xlsx, .xls) or CSV file.",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "File size must be less than 10MB.",
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Download template function
  const handleDownloadTemplate = () => {
    try {
      const link = document.createElement("a");
      link.href = "/client_template.xlsx";
      link.download = "client_template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Template downloaded", {
        description: "Please fill in the template with your client data.",
      });
    } catch (error) {
      toast.error("Download failed", {
        description: "Unable to download template. Please try again.",
      });
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please select a file first.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("documents", selectedFile, selectedFile.name);

      const response = await uploadClientsMutation.mutateAsync(formData);
      setUploadResult(response);

      if (response.success && onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      // Type guard to check if error is an AxiosError
      if (error instanceof AxiosError) {
        setUploadResult({
          success: false,
          message:
            error.response?.data?.message ||
            error.message ||
            "Upload failed. Please try again.",
        });
      } else if (error instanceof Error) {
        setUploadResult({
          success: false,
          message: error.message || "Upload failed. Please try again.",
        });
      } else {
        setUploadResult({
          success: false,
          message: "Upload failed. Please try again.",
        });
      }
    }
  };

  // Reset form
  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setUploadResult(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const defaultTrigger = (
    <Button className="gap-2 bg-[#210EAB] px-4 py-2 hover:bg-[#210EAB]/90 text-white">
      <Plus className="h-4 w-4" />
      Add Bulk Clients
    </Button>
  );

  const isUploading = uploadClientsMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#210EAB]" />
            Bulk Upload Client Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">
                  Need a template?
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Download our Excel template with the correct format and column
                  headers for bulk client upload.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Client Data File
            </label>

            {!selectedFile ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-[#210EAB] bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-[#210EAB] hover:text-[#210EAB]/90">
                      Click to select
                    </span>{" "}
                    or drag and drop your Excel file here
                  </div>
                  <div className="text-xs text-gray-500">
                    Supports .xlsx, .xls, and .csv files (max 10MB)
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-gray-500 hover:text-red-500"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              {uploadResult.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium text-green-900">
                      Upload Successful!
                    </h4>
                  </div>

                  {uploadResult.summary && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div>
                          Total Rows:{" "}
                          <span className="font-medium">
                            {uploadResult.summary.totalRows}
                          </span>
                        </div>
                        <div>
                          Valid Rows:{" "}
                          <span className="font-medium text-green-600">
                            {uploadResult.summary.validRows}
                          </span>
                        </div>
                        <div>
                          Invalid Rows:{" "}
                          <span className="font-medium text-red-600">
                            {uploadResult.summary.invalidRows}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div>
                          Successful:{" "}
                          <span className="font-medium text-green-600">
                            {uploadResult.summary.successfulRegistrations}
                          </span>
                        </div>
                        <div>
                          Duplicates:{" "}
                          <span className="font-medium text-yellow-600">
                            {uploadResult.summary.duplicates}
                          </span>
                        </div>
                        <div>
                          Errors:{" "}
                          <span className="font-medium text-red-600">
                            {uploadResult.summary.errors}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h4 className="font-medium text-red-900">Upload Failed</h4>
                  </div>
                  <p className="text-sm text-red-700">{uploadResult.message}</p>
                </div>
              )}

              {/* Detailed Results */}
              {uploadResult.details && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {uploadResult.details.parseErrors &&
                    uploadResult.details.parseErrors.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <h5 className="font-medium text-yellow-900 mb-2">
                          Parse Warnings:
                        </h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {uploadResult.details.parseErrors.map(
                            (error, idx) => (
                              <li key={idx} className="list-disc list-inside">
                                {error}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {uploadResult.details.registrationErrors &&
                    uploadResult.details.registrationErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <h5 className="font-medium text-red-900 mb-2">
                          Registration Errors:
                        </h5>
                        <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResult.details.registrationErrors.map(
                            (error, idx) => (
                              <li key={idx} className="list-disc list-inside">
                                Row {error.row}: {error.email} - {error.error}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {uploadResult.details.duplicates &&
                    uploadResult.details.duplicates.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <h5 className="font-medium text-yellow-900 mb-2">
                          Duplicate Clients:
                        </h5>
                        <ul className="text-sm text-yellow-800 space-y-1 max-h-32 overflow-y-auto">
                          {uploadResult.details.duplicates.map((dup, idx) => (
                            <li key={idx} className="list-disc list-inside">
                              Row {dup.row}: {dup.email} - {dup.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {uploadResult?.success ? "Close" : "Cancel"}
            </Button>

            {!uploadResult?.success && (
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="gap-2 bg-[#210EAB] hover:bg-[#210EAB]/90"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
