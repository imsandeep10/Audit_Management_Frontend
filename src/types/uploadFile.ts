

export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

export interface UploadProgress {
  [fieldName: string]: {
    progress: number;
    loaded: number;
    total: number;
  };
}

export interface FileUploadFieldProps {
  name: string;
  onFilesChange: (files: FileWithPreview[]) => void;
  files?: FileWithPreview[];
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  disabled?: boolean;
  label?: string;
  className?: string;
  showPreview?: boolean; // New prop to control preview display
}
