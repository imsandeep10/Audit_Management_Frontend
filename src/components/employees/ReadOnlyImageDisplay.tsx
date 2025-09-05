import { Eye } from "lucide-react";
import { Label } from "../../components/ui/label";

interface ReadOnlyImageDisplayProps {
  imageId?: string | null;
  image?: { url?: string; filename?: string } | null;
  label: string;
  documentType?: string;
}

export const ReadOnlyImageDisplay: React.FC<ReadOnlyImageDisplayProps> = ({
  imageId,
  image,
  label,
  documentType,
}) => {
  // Prefer image.url if available
  if (image && image.url) {
    return (
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 ">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-gray-600" />
            <span className="text-sm text-gray-700">
              {documentType ? `${documentType} document` : "Profile image"}{" "}
              uploaded
            </span>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              Read Only
            </span>
          </div>
          <img
            src={image.url}
            alt={image.filename || label}
            className="w-16 h-16 object-cover rounded border"
            style={{ maxWidth: 64, maxHeight: 64 }}
          />
          <p className="text-xs text-gray-500 mt-2">{image.filename}</p>
        </div>
      </div>
    );
  }
  // Fallback to imageId only
  if (!imageId) {
    return (
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
          <p className="text-gray-500 text-sm">image can not edit</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-gray-600" />
            <span className="text-sm text-gray-700">
              {documentType ? `${documentType} document` : "Profile image"}{" "}
              uploaded
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            Read Only
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Image ID: {imageId}</p>
      </div>
    </div>
  );
};
