import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { UploadImage } from "../../components/ui/uploadImage";
import DatePicker from "../../components/date picker/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Eye, EyeOff, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useCreateEmployee, useUpdateEmployee } from "../../api/useEmployee";
import type z from "zod";
import {
  employeeSchema,
  editEmployeeSchema,
} from "../../schemas/employeeSchema";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useGetEmployeeById } from "../../api/useEmployee";
import { ReadOnlyImageDisplay } from "../../components/employees/ReadOnlyImageDisplay";

type EmployeeFormData = z.infer<typeof employeeSchema>;
type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>;
type FormData = EmployeeFormData | EditEmployeeFormData;

interface EmployeeFormProps {
  mode: "create" | "edit";
  employeeId?: string;
  initialData?: Partial<EmployeeFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

const useStepValidation = () => {
  const getFieldsForStep = (
    step: number,
    isEditMode: boolean = false
  ): (keyof EmployeeFormData)[] => {
    switch (step) {
      case 1:
        return isEditMode
          ? ["fullName", "email", "address", "position", "DOB"]
          : ["fullName", "email", "address", "position", "DOB", "password"];
      case 2:
        return isEditMode
          ? ["phoneNumber", "panNumber", "documentType", "documentImageId"] // Added required fields for edit mode
          : [
              "phoneNumber",
              "profileImageId",
              "panNumber",
              "documentType",
              "documentImageId",
            ];
      default:
        return [];
    }
  };

  return { getFieldsForStep };
};

function formatDateForInput(dateString: string) {
  if (!dateString) return "";
  return dateString.split("T")[0];
}

const EmployeeForm = ({
  mode = "create",
  onSuccess,
  onCancel,
}: EmployeeFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [uploadedDocumentImageId, setUploadedDocumentImageId] = useState<
    string | null
  >(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee(id || "");

  const isEditMode = mode === "edit";
  const { mutate, isPending } = isEditMode
    ? updateEmployeeMutation
    : createEmployeeMutation;
  const { getFieldsForStep } = useStepValidation();

  const schema = isEditMode ? editEmployeeSchema : employeeSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      position: "",
      DOB: "",
      password: "",
      profileImageId: "",
      phoneNumber: "",
      documentType: undefined,
      panNumber: "",
      documentImageId: "",
      role: "employee",
    },
  });

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && currentStep === 1) {
      e.preventDefault();
      handleNext();
    }
  };

  const employeeId = isEditMode && id ? id : "";
  const { data: employeeData } = useGetEmployeeById(employeeId);

  useEffect(() => {
    if (isEditMode && employeeData?.data?.employee && !isInitialized) {
      const employee = employeeData.data.employee;
      const user = employee.user;

      // Map user fields
      if (user) {
        Object.entries(user).forEach(([key, value]) => {
          if (value !== undefined && key !== "_id" && key !== "__v") {
            if (key === "DOB" && typeof value === "string") {
              setValue("DOB", formatDateForInput(value));
            } else {
              setValue(key as keyof EditEmployeeFormData, value as string);
            }
          }
        });
      }

      // Map employee fields
      Object.entries(employee).forEach(([key, value]) => {
        if (
          value !== undefined &&
          key !== "_id" &&
          key !== "__v" &&
          key !== "user" &&
          key !== "createdAt" &&
          key !== "updatedAt" &&
          key !== "assignedClients" &&
          key !== "assignedTasks" &&
          key !== "isActive" &&
          key !== "status" &&
          key !== "profileImageId" &&
          key !== "documentImageId"
        ) {
          setValue(key as keyof EditEmployeeFormData, value as string);
        }
      });

      if (user?.profileImageId) {
        const profileImageId =
          typeof user.profileImageId === "string"
            ? user.profileImageId
            : user.profileImageId?._id || user.profileImageId;
        setUploadedImageId(profileImageId);
        setValue("profileImageId", profileImageId);
      }
      if (employee.documentImageId) {
        const documentImageId =
          typeof employee.documentImageId === "string"
            ? employee.documentImageId
            : employee.documentImageId?._id || employee.documentImageId;
        setUploadedDocumentImageId(documentImageId);
        setValue("documentImageId", documentImageId);
      }

      setIsInitialized(true);
    }
  }, [employeeData, isEditMode, setValue, isInitialized]);

  const handleImageSelect = (imageId: string) => {
    setUploadedImageId(imageId);
    setValue("profileImageId", imageId);
  };

  const handleImageRemove = () => {
    setUploadedImageId(null);
    setValue("profileImageId", "");
  };

  const handleDocumentImageSelect = (imageId: string) => {
    setUploadedDocumentImageId(imageId);
    setValue("documentImageId", imageId);
  };

  const handleDocumentImageRemove = () => {
    setUploadedDocumentImageId(null);
    setValue("documentImageId", "");
  };

  const handleDocumentTypeSelect = (value: string) => {
    setValue("documentType", undefined);
    setTimeout(() => {
      setValue(
        "documentType",
        value as "citizenship" | "passport" | "panNumber"
      );
      setSelectedDocumentType(value);
      setShowDocumentModal(true);
    }, 0);
  };

  const handleModalSave = () => {
    // toast.success("Document saved successfully");
  };

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const fieldsToValidate = getFieldsForStep(currentStep, isEditMode);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const onSubmit = (data: FormData) => {
    const submitData = isEditMode
      ? {
          fullName: data.fullName,
          email: data.email,
          address: data.address,
          position: data.position,
          DOB: data.DOB,
          phoneNumber: data.phoneNumber,
          panNumber: data.panNumber,
        }
      : {
          ...data,
          profileImageId: uploadedImageId || undefined,
          documentImageId: uploadedDocumentImageId || undefined,
        };

    // Remove employee ID from request body since it's passed in URL
    if (isEditMode && id) {
      delete (submitData as Record<string, unknown>)._id;
    }
    mutate(submitData as EmployeeFormData, {
      onSuccess: () => {
        navigate("/employees");
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    });
  };

  const handleClose = () => {
    reset();
    setUploadedImageId(null);
    setUploadedDocumentImageId(null);
    setCurrentStep(1);
    onCancel?.();
    navigate("/employees");
  };

  const renderStepIndicator = () => (
    <div className="flex flex-row items-center justify-around">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 1
            ? "bg-[#210EAB] text-white"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        1
      </div>

      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
          currentStep >= 2
            ? "bg-[#210EAB] text-white"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        2
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* fullname */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">
          Full Name <span className="text-sm text-red-600">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter full name"
          {...register("fullName")}
          className={`py-6 ${errors.fullName ? "border-red-500" : ""}`}
        />
        {errors.fullName && (
          <span className="text-red-500 text-sm">
            {errors.fullName.message}
          </span>
        )}
      </div>
      {/* email */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">
          E-mail <span className="text-sm text-red-600">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          {...register("email")}
          className={`py-6 ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>
      {/* address */}
      <div className="flex flex-col gap-2 ">
        <Label htmlFor="address">
          Address <span className="text-sm text-red-600">*</span>
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter address"
          {...register("address")}
          className={`py-6 ${errors.address ? "border-red-500" : ""}`}
        />
        {errors.address && (
          <span className="text-red-500 text-sm">{errors.address.message}</span>
        )}
      </div>
      {/* position */}
      <div className="flex flex-col gap-2 ">
        <Label htmlFor="position">
          Position <span className="text-sm text-red-600">*</span>
        </Label>
        <Input
          id="position"
          type="text"
          placeholder="Enter position"
          {...register("position")}
          className={`py-6 ${errors.position ? "border-red-500" : ""}`}
        />
        {errors.position && (
          <span className="text-red-500 text-sm">
            {errors.position.message}
          </span>
        )}
      </div>
      {/* DOB */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <DatePicker
          
            id="DOB"
            name="DOB"
            label="Date of Birth (DOB)"
            value={watch("DOB") || ""}
            onChange={(value) => setValue("DOB", value)}
            required={true}
            className={errors.DOB ? "border-red-500" : ""}
            convertToBS={true}
            minAge={18}
          />
          {errors.DOB && (
            <span className="text-red-500 text-sm">{errors.DOB.message}</span>
          )}
        </div>
      </div>
      {/* password - only show in create mode */}
      {!isEditMode && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            Password <span className="text-sm text-red-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              {...register("password")}
              className={`py-6 ${errors.password ? "border-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => togglePassword()}
              aria-label={showPassword ? "Hide password" : "show password"}
              className="absolute top-4 right-1 px-2"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-8">
      {/* phoneNumber */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="phoneNumber">
          Phone Number <span className="text-sm text-red-600">*</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Enter phone number"
          {...register("phoneNumber")}
          className={`py-6 ${errors.phoneNumber ? "border-red-500" : ""}`}
        />
        {errors.phoneNumber && (
          <span className="text-red-500 text-sm">
            {errors.phoneNumber.message}
          </span>
        )}
      </div>

      {/* panNumber */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="panNumber">
          PAN Number <span className="text-sm text-red-600">*</span>
        </Label>
        <Input
          id="panNumber"
          type="text"
          placeholder="Enter PAN number"
          {...register("panNumber")}
          className={`py-6 ${errors.panNumber ? "border-red-500" : ""}`}
        />
        {errors.panNumber && (
          <span className="text-red-500 text-sm">
            {errors.panNumber.message}
          </span>
        )}
      </div>

      {/* Profile Image - show upload in create mode, read-only display in edit mode */}
      {!isEditMode ? (
        <div className="flex flex-col gap-2 ">
          <Label htmlFor="profileImage">
            Profile Image <span className="text-sm text-red-600">*</span>
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
            placeholder="upload profile image"
            disabled={isPending}
          />
          {errors.profileImageId && (
            <span className="text-red-500 text-sm">
              {errors.profileImageId.message}
            </span>
          )}
        </div>
      ) : (
        <div>
          <ReadOnlyImageDisplay
            imageId={uploadedImageId}
            image={employeeData?.data?.employee?.user?.profileImageId}
            label="Profile Image"
          />
        </div>
      )}

      {/* Document Type and Image - show upload in create mode, read-only display in edit mode */}
      {!isEditMode ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="documentType">
            Document Type <span className="text-sm text-red-600">*</span>
          </Label>
          <Select
            value={watch("documentType") || undefined}
            onValueChange={handleDocumentTypeSelect}
          >
            <SelectTrigger className="h-14 w-full py-6">
              <SelectValue placeholder="select document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="citizenship"
                onSelect={() => handleDocumentTypeSelect("citizenship")}
              >
                Citizenship
              </SelectItem>
              <SelectItem
                value="passport"
                onSelect={() => handleDocumentTypeSelect("passport")}
              >
                Passport
              </SelectItem>
              <SelectItem
                value="panNumber"
                onSelect={() => handleDocumentTypeSelect("panNumber")}
              >
                PAN Number
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Show status if document image is uploaded */}
          {watch("documentType") && uploadedDocumentImageId && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              ✓ {watch("documentType")} document uploaded
              <button
                type="button"
                onClick={() => setShowDocumentModal(true)}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Change
              </button>
            </div>
          )}
          {errors.documentType && (
            <span className="text-red-500 text-sm">
              {errors.documentType.message}
            </span>
          )}
        </div>
      ) : (
        <ReadOnlyImageDisplay
          imageId={uploadedDocumentImageId}
          image={employeeData?.data?.employee?.documentImageId?.url}
          label="Document Image"
          documentType={watch("documentType")}
        />
      )}
    </div>
  );

  const renderStepButtons = () => {
    if (currentStep === 1) {
      return (
        <div className="flex gap-4 justify-between pb-24 pt-8 ">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="h-12 w-35 border border-black"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => handleNext(e)}
            className="bg-[#210EAB] hover:bg-[#210EAB]/90 h-12 w-35"
            disabled={isPending}
          >
            Next
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-4 justify-between pb-24">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isPending}
          className="h-12 w-35 border border-black"
        >
          Previous
        </Button>
        <Button
          type="submit"
          className="bg-[#210EAB] hover:bg-[#210EAB]/90 h-12 w-35"
          disabled={isPending}
          onClick={async () => {
            // Manually trigger validation to see what's wrong
            const isValid = await trigger();
            if (!isValid) {
              toast.error("Validation failed. Please check your inputs.");
            }
          }}
        >
          {isPending
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
            ? "Update Employee"
            : "Save Employee"}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-auto ">
      <form
        onSubmit={(e) => {
          // Only submit if we're on step 2 and it's the submit button
          if (currentStep === 1) {
            e.preventDefault();
            return;
          }
          handleSubmit(onSubmit)(e);
        }}
        onKeyDown={handleFormKeyDown} // Prevent auto-submit on enter
      >
        <div className="flex flex-col gap-6 px-10   h-screen overflow-y-auto">
          <h3 className="text-2xl font-semibold text-gray-900 pt-10 flex flex-row items-center gap-5">
            {isEditMode ? "Edit Employee" : "Add Employee"}
          </h3>
          {renderStepIndicator()}
          <div className="pt-10  ">
            {currentStep === 1 && <div>{renderStep1()}</div>}
            {currentStep === 2 && <div>{renderStep2()}</div>}
            {renderStepButtons()}
          </div>
          {/* Document Upload Modal - only show in create mode */}
          <div>
            {!isEditMode && (
              <DocumentUploadModal
                isOpen={showDocumentModal}
                onClose={() => setShowDocumentModal(false)}
                documentType={selectedDocumentType}
                onImageSelect={handleDocumentImageSelect}
                onImageRemove={handleDocumentImageRemove}
                onSave={handleModalSave}
                disabled={isPending}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
