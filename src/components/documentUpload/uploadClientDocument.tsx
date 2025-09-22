import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUploadField } from "./fileUpload";
import {
  type FileWithPreview,
  type UploadProgress,
} from "../../types/uploadFile";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";

// Define validation schema with Zod
const stage1Schema = z.object({
  documents1: z.any().optional(),
  documents2: z.any().optional(),
  documents3: z.any().optional(),
  documents4: z.any().optional(),
});

type Stage1FormData = z.infer<typeof stage1Schema>;

type DocumentType = "registration" | "tax_clearance" | "audit_report" | "other";

export const UploadClientDocument = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { clientId, clientName, userType, companyName } = location.state || {};
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

  // Determine the actual user type - use passed userType or derive from auth context
  const actualUserType = userType || user?.role || 'admin';

  // Stage 1 form
  const stage1Form = useForm<Stage1FormData>({
    resolver: zodResolver(stage1Schema),
  });

  // Generic file upload function
  const uploadFiles = async (
    files: FileWithPreview[],
    documentType: DocumentType
  ) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });

    formData.append("documentType", documentType);

    const response = await axiosInstance.post(
      `/files/documents/${clientId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const total = progressEvent.total;
            const progressKey = documentType;
            setUploadProgress((prev) => ({
              ...prev,
              [progressKey]: {
                progress: Math.round((progressEvent.loaded * 100) / total),
                loaded: progressEvent.loaded,
                total: total,
              },
            }));



          }
        },
      }
    );
    return response.data;
  };

  const { mutateAsync: uploadStage1Mutation, isPending: isStage1Pending } =
    useMutation({
      mutationFn: async (data: Stage1FormData) => {
        const uploads = [];

        if (data.documents1?.length) {
          uploads.push(uploadFiles(data.documents1, "registration"));
        }
        if (data.documents2?.length) {
          uploads.push(uploadFiles(data.documents2, "tax_clearance"));
        }
        if (data.documents3?.length) {
          uploads.push(uploadFiles(data.documents3, "audit_report"));
        }
        if (data.documents4?.length) {
          uploads.push(uploadFiles(data.documents4, "other"));
        }

        if (uploads.length === 0) {
          throw new Error("Please select at least one document to upload");
        }

        return Promise.all(uploads);
      },
      onSuccess: () => {
        toast.success("Documents uploaded successfully!");
        setUploadProgress({});
        // Navigate to stage 2 or back to documents list
        const documentsPath = actualUserType === 'employee'
          ? `/employee/clients/${clientId}/documents`
          : `/clients/${clientId}/documents`;

        navigate(documentsPath, {
          state: { clientId, clientName, userType: actualUserType, companyName },
        });
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        toast.error("File upload failed. Please try again.", {
          description: error.message,
        });
      },
    });

  const handleStage1FilesChange =
    (fieldName: keyof Stage1FormData) => (files: FileWithPreview[]) => {
      stage1Form.setValue(fieldName, files);
    };

  const onSubmitStage1 = stage1Form.handleSubmit(async (data) => {
    await uploadStage1Mutation(data);
  });

  return (
    <div
      className="max-w-7xl mx-auto p-6 overflow-y-auto my-5"
      style={{ maxHeight: "90vh" }}
    >
      <div className="flex justify-between items-center font-poppins px-1">
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1">
            Upload Documents for {clientName}
          </h1>
        <p className="text-gray-800 space-x-3 font-semibold"><span className="text-gray-600">Company Name:</span> {companyName || " Company Name Not Provided"}</p>
        </div>
        <div className="flex items-center gap-4 mr-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const documentsPath = actualUserType === 'employee'
                ? `/employee/clients/${clientId}/documents`
                : `/clients/${clientId}/documents`;

              navigate(documentsPath, {
                state: {
                  clientId: clientId,
                  userName: clientName,
                  userType: actualUserType,
                  companyName: companyName
                },
              });
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            View Documents
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const billsPath = actualUserType === 'employee'
                ? `/employee/clients/${clientId}/upload-client-bills`
                : `/clients/${clientId}/upload-client-bills`;

              navigate(billsPath, {
                state: {
                  clientId: clientId,
                  clientName: clientName,
                  userType: actualUserType,
                  companyName: companyName
                },
              });
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            Upload Bills
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmitStage1} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Registration Documents */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Registration Documents
            </label>
            <FileUploadField
              name="documents1"
              onFilesChange={handleStage1FilesChange("documents1")}
              className="h-full"
              showPreview={true}
            />
          </div>

          {/* Tax Clearance */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tax Clearance
            </label>
            <FileUploadField
              name="documents2"
              onFilesChange={handleStage1FilesChange("documents2")}
              className="h-full"
              showPreview={true}
            />
          </div>

          {/* Audit Report */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Audit Report
            </label>
            <FileUploadField
              name="documents3"
              onFilesChange={handleStage1FilesChange("documents3")}
              className="h-full"
              showPreview={true}
            />
          </div>

          {/* Other Documents */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Other Documents
            </label>
            <FileUploadField
              name="documents4"
              onFilesChange={handleStage1FilesChange("documents4")}
              className="h-full"
              showPreview={true}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isStage1Pending}
            className="px-6 py-2"
          >
            {isStage1Pending ? "Uploading..." : "Upload Documents"}
          </Button>
        </div>
      </form>

      {/* Display upload progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium">Upload Progress</h3>
          {Object.entries(uploadProgress).map(([progressKey, progress]) => (
            <div key={progressKey} className="bg-gray-100 p-3 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium capitalize">
                  {progressKey.replace("_", " ")} - {progress.progress}%
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress.loaded / 1024)} KB /{" "}
                  {Math.round(progress.total / 1024)} KB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};