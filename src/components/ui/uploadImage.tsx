import * as React from "react";
import { useState, useCallback } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { useImageUpload } from "../../api/useImage";
import type {
  UploadImageProps,
  UseImageUploadReturn,
} from "../../types/uploadImageTypes";

const useImageUploadComponent = ({
  onImageSelect,
  onImageRemove,
  maxSize = 5,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
}: {
  onImageSelect?: (imageId: string) => void;
  onImageRemove?: () => void;
  maxSize?: number;
  acceptedFormats?: string[];
} = {}): UseImageUploadReturn => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadImageMutation = useImageUpload();
  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      if (!acceptedFormats.includes(file.type)) {
        setError(
          `Please upload a valid image file (${acceptedFormats.join(", ")})`
        );
        return false;
      }

      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return false;
      }

      return true;
    },
    [acceptedFormats, maxSize]
  );

  const processFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedImage(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          // Auto-upload after preview is set
          setTimeout(() => {
            if (file) {
              setIsUploading(true);
              uploadImageMutation.mutate(file, {
                onSuccess: (data) => {
                  if (data.success && data.data?.imageId) {
                    if (onImageSelect) {
                      onImageSelect(data.data.imageId);
                    }
                    setError(null);
                  } else {
                    setError("Failed to upload image");
                  }
                  setIsUploading(false);
                },
                onError: (error) => {
                  console.error("Upload error:", error);
                  setError("Failed to upload image. Please try again.");
                  setIsUploading(false);
                },
              });
            }
          }, 100);
        };
        reader.readAsDataURL(file);
      }
    },
    [validateFile, uploadImageMutation, onImageSelect]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    onImageRemove?.();
  }, [onImageRemove]);

  return {
    selectedImage,
    imagePreview,
    error,
    isUploading,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    removeImage,
  };
};

// Upload Image Component
export const UploadImage = ({
  onImageSelect,
  onImageRemove,
  maxSize = 2,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  className,
  disabled = false,
  placeholder = "upload image",
}: UploadImageProps) => {
  const {
    selectedImage,
    imagePreview,
    error,
    isUploading,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    removeImage,
  } = useImageUploadComponent({
    onImageSelect,
    onImageRemove,
    maxSize,
    acceptedFormats,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {!imagePreview ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "border-2 border-dashed border-input rounded-lg p-1 text-center cursor-pointer transition-colors",
            "hover:border-ring hover:bg-accent/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled &&
              "opacity-50 cursor-not-allowed hover:border-input hover:bg-transparent"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
          <div className="flex flex-col items-center space-y-1  h-10">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-3 h-3 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="flex">
              <p className="text-xs font-medium text-foreground">
                {placeholder}
              </p>
              {/* <p className="text-[10px] text-muted-foreground">
                Supports:{" "}
                {acceptedFormats
                  .map((format) => format.split("/")[1])
                  .join(", ")}{" "}
                up to {maxSize}MB
              </p> */}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-24 object-cover rounded-lg border"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-xs font-medium">
                  Uploading...
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeImage}
              className="absolute top-1 right-1 h-6 w-6"
              disabled={disabled || isUploading}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {selectedImage && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{selectedImage.name}</span>
              <span>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
