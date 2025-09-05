import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { UploadImage } from "../ui/uploadImage";
import { X } from "lucide-react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  onImageSelect: (imageId: string) => void;
  onImageRemove: () => void;
  onSave: () => void;
  disabled?: boolean;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  documentType,
  onImageSelect,
  onImageRemove,
  onSave,
  disabled = false,
}) => {
  const [hasImage, setHasImage] = useState(false);

  const handleImageSelect = (imageId: string) => {
    setHasImage(true);
    onImageSelect(imageId);
  };

  const handleImageRemove = () => {
    setHasImage(false);
    onImageRemove();
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleClose = () => {
    if (hasImage) {
      handleImageRemove();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {documentType.charAt(0).toUpperCase() + documentType.slice(1)} Photo
            Upload
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <Label htmlFor="documentImage" className="block mb-2">
            Upload Document Image
          </Label>
          <UploadImage
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            maxSize={5}
            acceptedFormats={[
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/webp",
            ]}
            placeholder="Drag and Drop a file or Click"
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={disabled}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={disabled || !hasImage}
            className="bg-[#210EAB] hover:bg-[#210EAB]/90 px-6"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
