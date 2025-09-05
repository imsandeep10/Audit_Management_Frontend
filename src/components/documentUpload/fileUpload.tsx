import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, File } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  type FileWithPreview,
  type FileUploadFieldProps,
} from "../../types/uploadFile";

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  onFilesChange,
  maxFiles = 5,
  acceptedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "text/plain",
    "text/csv",
  ],
  maxFileSize = 100,
  disabled = false,
  label,
  className,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const errorMessages = rejectedFiles
          .map(({ errors }) => errors.map((e: any) => e.message).join(", "))
          .join("; ");
        setError(errorMessages);
        return;
      }

      const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: `${file.name}-${Date.now()}`,
        });
        return fileWithPreview;
      });

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, onFilesChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxFiles,
    maxSize: maxFileSize * 1024 * 1024,
    disabled,
  });

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((current) => {
        const file = current.find((f) => f.id === fileId);
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }
        const updatedFiles = current.filter((f) => f.id !== fileId);
        onFilesChange(updatedFiles);
        return updatedFiles;
      });
    },
    [onFilesChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          "min-h-[120px] flex flex-col items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-xs text-gray-600 mb-1">
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select files"}
        </p>
        <p className="text-2xs text-gray-500">
          Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max {maxFileSize}MB
          each)
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
            >
              <div className="flex items-center min-w-0">
                <File className="h-4 w-4 text-gray-500 flex-shrink-0 mr-2" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-2xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeFile(file.id!)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
