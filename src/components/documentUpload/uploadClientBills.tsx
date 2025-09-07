import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUploadField } from "./fileUpload";
import { type FileWithPreview } from "../../types/uploadFile";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import DatePicker from "../date picker/date-picker";
import { PANAutocomplete } from "../common/PANAutocomplete";
import { useCustomerSuggestions } from "../../hooks/useCustomerSuggestions";
import type {
  BillType,
  UploadProgress,
  UploadProgressItem,
  DocumentType,
  CustomerSuggestion,
} from "../../api/BillsService";
import {
  billsSchema,
  type BillsFormData,
  type DocumentType as SchemaDocumentType,
} from "./billsSchema";
import {
  DEFAULT_PURCHASE_VALUES,
  DEFAULT_SALES_VALUES,
  DOCUMENT_TYPE_OPTIONS,
  UI_CONSTANTS,
  VALIDATION_PATTERNS,
} from "./billsConstants";
import { useCreateBill, useUploadFiles } from "../../api/useBills";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export const UploadClientBills = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { clientId, clientName, userType, companyName } = location.state || {};
  const navigate = useNavigate();

  // Determine the actual user type - use passed userType or derive from auth context
  const actualUserType = userType || user?.role || 'admin';

  // State
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState<{
    sales: boolean;
    purchase: boolean;
  }>({
    sales: false,
    purchase: false,
  });

  // Form
  const billsForm = useForm<BillsFormData>({
    resolver: zodResolver(billsSchema),
    defaultValues: {
      sales: DEFAULT_SALES_VALUES,
      purchase: DEFAULT_PURCHASE_VALUES,
    },
    mode: "onBlur",
  });

  // Progress handlers
  const handleUploadStart = (billType: BillType) => {
    setIsUploading((prev) => ({ ...prev, [billType]: true }));
  };

  const handleUploadEnd = (billType: BillType) => {
    setIsUploading((prev) => ({ ...prev, [billType]: false }));
  };

  const handleProgressUpdate = (
    progressKey: string,
    progressItem: UploadProgressItem
  ) => {
    setUploadProgress((prev) => ({
      ...prev,
      [progressKey]: progressItem,
    }));
  };

  const handleProgressClear = (progressKey: string) => {
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[progressKey];
      return newProgress;
    });
  };

  // Hooks
  const uploadFilesMutation = useUploadFiles({
    onUploadStart: handleUploadStart,
    onUploadEnd: handleUploadEnd,
    onProgressUpdate: handleProgressUpdate,
    onProgressClear: handleProgressClear,
  });

  const createSalesBillMutation = useCreateBill({
    onSuccess: () => {
      toast.success("sales bill created");
      window.location.reload();
    },
  });

  const createPurchaseBillMutation = useCreateBill({
    onSuccess: () => {
      toast.success("Purchase Bill created");
    },
  });

  // Customer suggestions hook
  const { data: customerSuggestions = [], isLoading: isLoadingCustomers } = useCustomerSuggestions(clientId);

  // Auto-fill form when customer is selected
  const handleCustomerSelect = (billType: BillType) => (customer: CustomerSuggestion) => {
    // Fill customer name and PAN
    billsForm.setValue(`${billType}.customerName`, customer.customerName);
    billsForm.setValue(`${billType}.customerPan`, customer.customerPan);

    // Set document type to match the selected customer's preference
    billsForm.setValue(`${billType}.documentType`, customer.documentType);

    // Set registration type to match the selected customer's preference
    billsForm.setValue(`${billType}.registrationType`, customer.registrationType);

    // Set phone number if available
    billsForm.setValue(`${billType}.phoneNumber`, customer.phoneNumber || 0);
  };


  const handleBillsFilesChange =
    (billType: BillType) =>
      async (files: FileWithPreview[]): Promise<void> => {
        billsForm.setValue(`${billType}.files`, files);

        if (files.length > 0) {
          try {
            const documentType = billsForm.getValues(`${billType}.documentType`);
            const documentIds = await uploadFilesMutation.mutateAsync({
              files,
              documentType: documentType as DocumentType,
              billType,
              clientId,
            });
            billsForm.setValue(`${billType}.documentIds`, documentIds);
          } catch (error) {
            console.error("File upload failed:", error);
            billsForm.setValue(`${billType}.files`, []);
            billsForm.setValue(`${billType}.documentIds`, []);
          }
        } else {
          billsForm.setValue(`${billType}.documentIds`, []);
        }
      };

  // Submit handlers
  const handleSalesBillSubmit = async () => {
    const isValid = await billsForm.trigger("sales");
    if (isValid) {
      const salesData = billsForm.getValues("sales");
      await createSalesBillMutation.mutateAsync({
        billData: salesData,
        documentIds: salesData.documentIds || [],
        billType: "sales",
        clientId,
      });
    }
  };

  const handlePurchaseBillSubmit = async () => {
    const isValid = await billsForm.trigger("purchase");
    if (isValid) {
      const purchaseData = billsForm.getValues("purchase");
      await createPurchaseBillMutation.mutateAsync({
        billData: purchaseData,
        documentIds: purchaseData.documentIds || [],
        billType: "purchase",
        clientId,
      });
    }
  };

  // Helper functions
  const getSalesDocumentIds = () => {
    return billsForm.watch("sales.documentIds") || [];
  };

  const getPurchaseDocumentIds = () => {
    return billsForm.watch("purchase.documentIds") || [];
  };

  return (
    <div
      className="max-w-7xl mx-auto p-6 overflow-y-auto my-5"
      style={{ maxHeight: UI_CONSTANTS.MAX_HEIGHT }}
    >
      <div className="flex justify-between items-center font-poppins px-1">
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1 text-center border-b-2">
            Upload Bills for {clientName || clientId}
          </h1>
          <p className="text-gray-800 space-x-3 font-semibold"><span className="text-gray-600">Company Name:</span> {companyName || " Company Name Not Provided"}</p>
        </div>
        <div className="flex items-center gap-4">
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
                  clientName: clientName,
                  userType: actualUserType,
                  companyName: companyName
                },
              });
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            View Bills
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const uploadPath = actualUserType === 'employee'
                ? `/employee/upload-client-documents/${clientId}`
                : `/upload-client-documents/${clientId}`;

              navigate(uploadPath, {
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
            Upload Documents
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Section */}
          <div className="space-y-4 p-6 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Sales Bill
                {isUploading.sales && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    (Uploading...)
                  </span>
                )}
              </h3>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Document Type <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value: string) =>
                  billsForm.setValue(
                    "sales.documentType",
                    value as SchemaDocumentType
                  )
                }
                value={billsForm.watch("sales.documentType")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("sales.customerName")}
                placeholder="Enter Customer Name"
                className="w-full"
              />
              {billsForm.formState.errors.sales?.customerName && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.customerName?.message}
                </p>
              )}
            </div>

            {/* Bill Date */}
            <div className="space-y-2">
              <DatePicker
                label="Bill Date"
                id="sales-bill-date"
                value={billsForm.watch("sales.billDate")}
                onChange={(date) => billsForm.setValue("sales.billDate", date)}
                required={true}
                convertToBS={true}
              />
              {billsForm.formState.errors.sales?.billDate && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.billDate?.message}
                </p>
              )}
            </div>

            {/* Bill Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bill Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("sales.billNo")}
                placeholder="Enter Bill Number"
                className="w-full"
              />
              {billsForm.formState.errors.sales?.billNo && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.billNo?.message}
                </p>
              )}
            </div>

            {/* Customer PAN (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Customer PAN Number <span className="text-red-500">*</span>
              </label>
              <PANAutocomplete
                value={billsForm.watch("sales.customerPan") || ""}
                onChange={(value) => billsForm.setValue("sales.customerPan", value)}
                onCustomerSelect={handleCustomerSelect("sales")}
                suggestions={customerSuggestions}
                placeholder="Enter 9-Digit PAN Number"
                className="w-full"
                maxLength={UI_CONSTANTS.PAN_MAX_LENGTH}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(
                    VALIDATION_PATTERNS.NUMBERS_ONLY,
                    ""
                  );
                }}
                required={true}
                name="sales.customerPan"
                isLoading={isLoadingCustomers}
              />
              {billsForm.formState.errors.sales?.customerPan && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.customerPan?.message}
                </p>
              )}
            </div>

            {/* chargeable amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("sales.amount", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter Amount"
                className="w-full"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  // Allow numbers and decimal point
                  target.value = target.value.replace(/[^0-9.]/g, "");
                  // Ensure only one decimal point
                  const parts = target.value.split(".");
                  if (parts.length > 2) {
                    target.value = parts[0] + "." + parts.slice(1).join("");
                  }
                }}
              />
              {billsForm.formState.errors.sales?.amount && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.amount?.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("sales.phoneNumber", { valueAsNumber: true })}
                type="number"
                placeholder="Enter Phone Number"
                className="w-full"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  // Allow only numbers
                  target.value = target.value.replace(/[^0-9]/g, "");
                }}
              />
              {billsForm.formState.errors.sales?.phoneNumber && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.phoneNumber?.message}
                </p>
              )}
            </div>

            {/* Customer Registration Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Customer Registration Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={billsForm.watch("sales.registrationType")}
                onValueChange={(value) =>
                  billsForm.setValue("sales.registrationType", value as any)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Registration Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="vat">VAT</SelectItem>
                </SelectContent>
              </Select>
              {billsForm.formState.errors.sales?.registrationType && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.sales.registrationType?.message}
                </p>
              )}
            </div>


            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload {billsForm.watch("sales.documentType").toUpperCase()}{" "}
                Documents <span className="text-red-500">*</span>
              </label>
              <FileUploadField
                name="salesFiles"
                onFilesChange={handleBillsFilesChange("sales")}
                className={`min-h-[${UI_CONSTANTS.MIN_FILE_UPLOAD_HEIGHT}]`}
                disabled={isUploading.sales}
              />
            </div>

            {/* Create Sales Bill Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                type="button"
                size="sm"
                onClick={handleSalesBillSubmit}
                disabled={
                  createSalesBillMutation.isPending ||
                  isUploading.sales ||
                  getSalesDocumentIds().length === 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createSalesBillMutation.isPending
                  ? "Creating..."
                  : "Create Sales Bill"}
              </Button>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="space-y-4 p-6 border-2 border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Purchase Bill
                {isUploading.purchase && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    (Uploading...)
                  </span>
                )}
              </h3>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Document Type <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value: string) =>
                  billsForm.setValue(
                    "purchase.documentType",
                    value as SchemaDocumentType
                  )
                }
                value={billsForm.watch("purchase.documentType")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Vendor<span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("purchase.customerName")}
                placeholder="Enter Vendor Name"
                className="w-full"
              />
              {billsForm.formState.errors.purchase?.customerName && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.customerName?.message}
                </p>
              )}
            </div>

            {/* Bill Date */}
            <div className="space-y-2">
              <DatePicker

                label="Bill Date"
                id="purchase-bill-date"
                value={billsForm.watch("purchase.billDate")}
                onChange={(date) =>
                  billsForm.setValue("purchase.billDate", date)
                }
                required={true}
                convertToBS={true}
              />
              {billsForm.formState.errors.purchase?.billDate && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.billDate?.message}
                </p>
              )}
            </div>

            {/* Customer Bill Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Supplier Bill Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("purchase.customerBillNo")}
                placeholder="Enter Supplier Bill Number"
                className="w-full"
              />
              {billsForm.formState.errors.purchase?.customerBillNo && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.customerBillNo?.message}
                </p>
              )}
            </div>

            {/* Supplier PAN (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Supplier PAN Number <span className="text-red-500">*</span>
              </label>
              <PANAutocomplete
                value={billsForm.watch("purchase.customerPan") || ""}
                onChange={(value) => billsForm.setValue("purchase.customerPan", value)}
                onCustomerSelect={handleCustomerSelect("purchase")}
                suggestions={customerSuggestions}
                placeholder="Enter 9-Digit PAN Number"
                className="w-full"
                maxLength={UI_CONSTANTS.PAN_MAX_LENGTH}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(
                    VALIDATION_PATTERNS.NUMBERS_ONLY,
                    ""
                  );
                }}
                required={true}
                name="purchase.customerPan"
                isLoading={isLoadingCustomers}
              />
              {billsForm.formState.errors.purchase?.customerPan && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.customerPan?.message}
                </p>
              )}
            </div>


            {/* Customer Chargeable Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("purchase.amount", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter Amount"
                className="w-full"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  // Allow numbers and decimal point
                  target.value = target.value.replace(/[^0-9.]/g, "");
                  // Ensure only one decimal point
                  const parts = target.value.split(".");
                  if (parts.length > 2) {
                    target.value = parts[0] + "." + parts.slice(1).join("");
                  }
                }}
              />
              {billsForm.formState.errors.purchase?.amount && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.amount?.message}
                </p>
              )}
            </div>


            {/* Supplier Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...billsForm.register("purchase.phoneNumber", { valueAsNumber: true })}
                type="number"
                placeholder="Enter Phone Number"
                className="w-full"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  // Allow only numbers
                  target.value = target.value.replace(/[^0-9]/g, "");
                }}
              />
              {billsForm.formState.errors.purchase?.phoneNumber && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.phoneNumber?.message}
                </p>
              )}
            </div>

            {/* Supplier Registration Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Supplier Registration Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={billsForm.watch("purchase.registrationType")}
                onValueChange={(value) =>
                  billsForm.setValue("purchase.registrationType", value as any)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Registration Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="vat">VAT</SelectItem>
                </SelectContent>
              </Select>
              {billsForm.formState.errors.purchase?.registrationType && (
                <p className="text-sm text-red-600">
                  {billsForm.formState.errors.purchase.registrationType?.message}
                </p>
              )}
            </div>


            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload {billsForm.watch("purchase.documentType").toUpperCase()}{" "}
                Documents <span className="text-red-500">*</span>
              </label>
              <FileUploadField
                name="purchaseFiles"
                onFilesChange={handleBillsFilesChange("purchase")}
                className={`min-h-[${UI_CONSTANTS.MIN_FILE_UPLOAD_HEIGHT}]`}
                disabled={isUploading.purchase}
              />
            </div>

            {/* Create Purchase Bill Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                type="button"
                size="sm"
                onClick={handlePurchaseBillSubmit}
                disabled={
                  createPurchaseBillMutation.isPending ||
                  isUploading.purchase ||
                  getPurchaseDocumentIds().length === 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createPurchaseBillMutation.isPending
                  ? "Creating..."
                  : "Create Purchase Bill"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Display upload progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium">Upload Progress</h3>
          {Object.entries(uploadProgress).map(([progressKey, progress]) => {
            const [billType, documentType] = progressKey.split("_");
            const displayName = `${billType.toUpperCase()} ${documentType.toUpperCase()}`;

            return (
              <div key={progressKey} className="bg-gray-100 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    {displayName} - {progress.progress}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress.loaded / 1024)} KB /{" "}
                    {Math.round(progress.total / 1024)} KB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`bg-blue-600 h-${UI_CONSTANTS.PROGRESS_BAR_HEIGHT} rounded-full transition-all duration-300`}
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
