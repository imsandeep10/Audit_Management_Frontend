// Types
export interface UploadImageProps {
  onImageSelect?: (imageId: string) => void; // Callback with imageId
  onImageRemove?: () => void;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export interface UseImageUploadReturn {
  selectedImage: File | null;
  imagePreview: string | null;
  error: string | null;
  isUploading: boolean;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  removeImage: () => void;
}
