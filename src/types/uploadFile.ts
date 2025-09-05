

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
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  disabled?: boolean;
  label?: string;
  className?: string;
}
