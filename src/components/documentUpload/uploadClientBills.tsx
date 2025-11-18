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
  type DocumentType as SchemaDocumentType,
} from "./billsSchema";
import { z } from "zod";
type BillsFormData = z.infer<typeof billsSchema>;
import {
  DEFAULT_PURCHASE_VALUES,
  DEFAULT_SALES_VALUES,
  DOCUMENT_TYPE_OPTIONS,
  UI_CONSTANTS,
  VALIDATION_PATTERNS,
} from "./billsConstants";
import {
  useUploadFiles,
  useCreateBill,
  useUpdateBill,
} from "../../api/useBills";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export const UploadClientBills = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { clientId, clientName, userType, companyName, billData, isUpdate } = location.state || {};
  const navigate = useNavigate();

  const actualUserType = userType || user?.role || 'admin';

  const convertDocumentsToFiles = (documents: any[]): FileWithPreview[] => {
    return documents.map((doc) => {
      const mockFile: FileWithPreview & { isExisting?: boolean; documentId?: string } = {
        id: doc._id || doc.id,
        preview: doc.documentURL || `${process.env.REACT_APP_BACKEND_URL}/uploads/files/${doc.filename}`,
        isExisting: true,
        documentId: doc._id || doc.id,
        size: doc.size || 0,
        name: doc.originalName || doc.filename,
        lastModified: Date.now(),
        type: 'application/octet-stream',
        webkitRelativePath: '',
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: () => Promise.resolve(''),
        bytes: () => Promise.resolve(new Uint8Array(0)),
      };
      return mockFile;
    });
  };

  const getDefaultValues = (): BillsFormData => {
    if (isUpdate && billData) {
      const defaultValues = {
        sales: DEFAULT_SALES_VALUES,
        purchase: DEFAULT_PURCHASE_VALUES,
      };

      const existingDocumentIds = (billData.documents || []).map(
        (doc: any) => doc._id || doc.id
      );

      if (billData.billType === 'sales') {
        defaultValues.sales = {
          documentType: billData.documentType,
          customerName: billData.customerName,
          billDate: billData.billDate ? new Date(billData.billDate).toISOString().split('T')[0] : '',
          billNo: billData.billNo || '',
          customerPan: billData.customerPan || '',
          amount: billData.amount || 0,
          phoneNumber: billData.phoneNumber ? billData.phoneNumber.toString() : '',
          registrationType: billData.registrationType,
          files: convertDocumentsToFiles(billData.documents || []),
          documentIds: existingDocumentIds,
        };
      } else if (billData.billType === 'purchase') {
        defaultValues.purchase = {
          documentType: billData.documentType,
          customerName: billData.customerName,
          billDate: billData.billDate ? new Date(billData.billDate).toISOString().split('T')[0] : '',
          customerBillNo: billData.customerBillNo || '',
          customerPan: billData.customerPan || '',
          amount: billData.amount || 0,
          phoneNumber: billData.phoneNumber ? billData.phoneNumber.toString() : '',
          registrationType: billData.registrationType,
          files: convertDocumentsToFiles(billData.documents || []),
          documentIds: existingDocumentIds,
        };
      }

      return defaultValues;
    }

    return {
      sales: DEFAULT_SALES_VALUES,
      purchase: DEFAULT_PURCHASE_VALUES,
    };
  };

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState<{
    sales: boolean;
    purchase: boolean;
  }>({
    sales: false,
    purchase: false,
  });

  const billsForm = useForm<BillsFormData>({
    resolver: zodResolver(billsSchema) as any,
    defaultValues: getDefaultValues(),
    mode: "onBlur",
  });

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

  const handleAmountInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    let value = target.value;
    
    const hasNegativeSign = value.startsWith('-');
    
    value = value.replace(/[^0-9.-]/g, "");
    
    if (hasNegativeSign && !value.startsWith('-')) {
      value = '-' + value.replace(/-/g, '');
    } else if (!hasNegativeSign) {
      value = value.replace(/-/g, '');
    }
    
    const decimalIndex = value.indexOf(".");
    if (decimalIndex !== -1) {
      const beforeDecimal = value.substring(0, decimalIndex);
      const afterDecimal = value.substring(decimalIndex + 1).replace(/\./g, "");
      value = beforeDecimal + "." + afterDecimal;
    }
    
    const parts = value.split(".");
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].substring(0, 2);
    }
    
    if (value === '-' || value === '-.') {
      // Allow intermediate states
    } else if (value !== '' && isNaN(parseFloat(value))) {
      value = '';
    }
    
    target.value = value;
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/[^0-9]/g, "");
  };

  const handlePANInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(VALIDATION_PATTERNS.NUMBERS_ONLY, "");
  };

  const uploadFilesMutation = useUploadFiles({
    onUploadStart: handleUploadStart,
    onUploadEnd: handleUploadEnd,
    onProgressUpdate: handleProgressUpdate,
    onProgressClear: handleProgressClear,
  });

  const createSalesBillMutation = useCreateBill({
    onSuccess: () => {
      toast.success("Sales bill created");
      window.location.reload();
    },
  });

  const createPurchaseBillMutation = useCreateBill({
    onSuccess: () => {
      toast.success("Purchase Bill created");
      window.location.reload();
    },
  });

  const updateBillMutation = useUpdateBill();

  const { data: customerSuggestions = [], isLoading: isLoadingCustomers } = useCustomerSuggestions(clientId);

  const handleCustomerSelect = (billType: BillType) => (customer: CustomerSuggestion) => {
    billsForm.setValue(`${billType}.customerName`, customer.customerName);
    billsForm.setValue(`${billType}.customerPan`, customer.customerPan);
    billsForm.setValue(`${billType}.documentType`, customer.documentType);
    billsForm.setValue(`${billType}.registrationType`, customer.registrationType);
    billsForm.setValue(`${billType}.phoneNumber`, customer.phoneNumber ? customer.phoneNumber.toString() : '');
  };

  const handleBillsFilesChange =
    (billType: BillType) =>
      async (files: FileWithPreview[]): Promise<void> => {
        billsForm.setValue(`${billType}.files`, files);

        if (files.length > 0) {
          try {
            const existingFiles = files.filter((f: any) => f.isExisting);
            const newFiles = files.filter((f: any) => !f.isExisting);

            const existingDocumentIds = existingFiles.map((f: any) => f.documentId).filter(Boolean);

            let newDocumentIds: string[] = [];
            if (newFiles.length > 0) {
              // FIX: Add null check for documentType with fallback
              const documentType = billsForm.getValues(`${billType}.documentType`) || 'tax';
              newDocumentIds = await uploadFilesMutation.mutateAsync({
                files: newFiles,
                documentType: documentType as DocumentType,
                billType,
                clientId,
              });
            }

            const allDocumentIds = [...existingDocumentIds, ...newDocumentIds];
            billsForm.setValue(`${billType}.documentIds`, allDocumentIds);
          } catch (error) {
            console.error("File upload failed:", error);
            const existingFiles = files.filter((f: any) => f.isExisting);
            const existingDocumentIds = existingFiles.map((f: any) => f.documentId).filter(Boolean);
            billsForm.setValue(`${billType}.files`, existingFiles);
            billsForm.setValue(`${billType}.documentIds`, existingDocumentIds);
          }
        } else {
          billsForm.setValue(`${billType}.documentIds`, []);
        }
      };

  const handleSalesBillSubmit = async () => {
    const isValid = await billsForm.trigger("sales");
    if (isValid) {
      const salesData = billsForm.getValues("sales");
      const formBillData = {
        documentType: salesData.documentType,
        customerName: salesData.customerName,
        billDate: salesData.billDate,
        billNo: salesData.billNo,
        customerPan: salesData.customerPan,
        amount: salesData.amount,
        phoneNumber: (salesData.phoneNumber && salesData.phoneNumber.trim() !== "") ? Number(salesData.phoneNumber) : undefined,
        registrationType: salesData.registrationType,
      };

      let documentIdsToSend = salesData.documentIds || [];
      
      if (isUpdate && billData) {
        if (documentIdsToSend.length === 0) {
          documentIdsToSend = billData.documentIds || [];
        }
        
        await updateBillMutation.mutateAsync({
          billId: billData._id,
          billData: formBillData,
          documentIds: documentIdsToSend,
          billType: "sales",
        });
        
        toast.success("Sales bill updated successfully");
        navigate(`/clients/${clientId}/documents`, { 
          state: { 
            clientId, 
            clientName, 
            companyName 
          } 
        });
      } else {
        await createSalesBillMutation.mutateAsync({
          billData: formBillData,
          documentIds: documentIdsToSend,
          billType: "sales",
          clientId,
        });
      }
    }
  };

  const handlePurchaseBillSubmit = async () => {
    const isValid = await billsForm.trigger("purchase");
    if (isValid) {
      const purchaseData = billsForm.getValues("purchase");
      const formBillData = {
        documentType: purchaseData.documentType,
        customerName: purchaseData.customerName,
        billDate: purchaseData.billDate,
        customerBillNo: purchaseData.customerBillNo,
        customerPan: purchaseData.customerPan,
        amount: purchaseData.amount,
        phoneNumber: (purchaseData.phoneNumber && purchaseData.phoneNumber.trim() !== "") ? Number(purchaseData.phoneNumber) : undefined,
        registrationType: purchaseData.registrationType,
      };

      let documentIdsToSend = purchaseData.documentIds || [];
      
      if (isUpdate && billData) {
        if (documentIdsToSend.length === 0) {
          documentIdsToSend = billData.documentIds || [];
        }
        
        await updateBillMutation.mutateAsync({
          billId: billData._id,
          billData: formBillData,
          documentIds: documentIdsToSend,
          billType: "purchase",
        });
        
        toast.success("Purchase bill updated successfully");
        navigate(`/clients/${clientId}/documents`, {
          state: { 
            clientId, 
            clientName, 
            companyName 
          } 
        });
      } else {
        await createPurchaseBillMutation.mutateAsync({
          billData: formBillData,
          documentIds: documentIdsToSend,
          billType: "purchase",
          clientId,
        });
      }
    }
  };

  // FIX: Safe document type getter with fallback
  const getDocumentTypeLabel = (billType: BillType): string => {
    const documentType = billsForm.watch(`${billType}.documentType`);
    return documentType ? documentType.toUpperCase() : "TAX";
  };

  return (
    <div
      className="max-w-7xl mx-auto p-6 overflow-y-auto my-5"
      style={{ maxHeight: UI_CONSTANTS.MAX_HEIGHT }}
    >
      <div className="flex justify-between items-center font-poppins px-1">
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1 text-center border-b-2">
            {isUpdate 
              ? `Update ${billData?.billType === 'sales' ? 'Sales' : 'Purchase'} Bill${billData?.billType === 'sales' ? ` - ${billData?.billNo}` : ` - ${billData?.customerBillNo}`}` 
              : `Upload Bills for ${clientName || clientId}`
            }
          </h1>
          <p className="text-gray-800 space-x-3 font-semibold">
            <span className="text-gray-600">Company Name:</span> {companyName || " Company Name Not Provided"}
          </p>
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
        <div className={`grid gap-6 ${isUpdate ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {(!isUpdate || (isUpdate && billData?.billType === 'sales')) && (
            <div className="space-y-4 p-6 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  {isUpdate ? 'Update Sales Bill' : 'Sales Bill'}
                  {isUploading.sales && (
                    <span className="ml-2 text-sm text-blue-600 font-normal">
                      (Uploading...)
                    </span>
                  )}
                </h3>
              </div>

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
                  onInput={handlePANInput}
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  {...billsForm.register("sales.amount", { valueAsNumber: true })}
                  type="text"
                  placeholder="Enter Amount"
                  className="w-full"
                  onInput={handleAmountInput}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      e.target.value = value.toFixed(2);
                      billsForm.setValue("sales.amount", value);
                    }
                  }}
                />
                {billsForm.formState.errors.sales?.amount && (
                  <p className="text-sm text-red-600">
                    {billsForm.formState.errors.sales.amount?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number (optional)
                </label>
                <Input
                  {...billsForm.register("sales.phoneNumber")}
                  type="text"
                  placeholder="Enter Phone Number"
                  className="w-full"
                  onInput={handlePhoneInput}
                />
                {billsForm.formState.errors.sales?.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {billsForm.formState.errors.sales.phoneNumber?.message}
                  </p>
                )}
              </div>

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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {/* FIX: Use safe document type getter */}
                  Upload {getDocumentTypeLabel("sales")} Documents <span className="text-red-500">*</span>
                </label>
                <FileUploadField
                  name="salesFiles"
                  files={billsForm.watch('sales.files')}
                  onFilesChange={handleBillsFilesChange("sales")}
                  className={`min-h-[${UI_CONSTANTS.MIN_FILE_UPLOAD_HEIGHT}]`}
                  disabled={isUploading.sales}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSalesBillSubmit}
                  disabled={
                    (isUpdate ? updateBillMutation.isPending : createSalesBillMutation.isPending) ||
                    isUploading.sales
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {(isUpdate ? updateBillMutation.isPending : createSalesBillMutation.isPending)
                    ? (isUpdate ? "Updating..." : "Creating...")
                    : (isUpdate ? "Update Sales Bill" : "Create Sales Bill")}
                </Button>
              </div>
            </div>
          )}

          {(!isUpdate || (isUpdate && billData?.billType === 'purchase')) && (
            <div className="space-y-4 p-6 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  {isUpdate ? 'Update Purchase Bill' : 'Purchase Bill'}
                  {isUploading.purchase && (
                    <span className="ml-2 text-sm text-blue-600 font-normal">
                      (Uploading...)
                    </span>
                  )}
                </h3>
              </div>

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
                  onInput={handlePANInput}
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  {...billsForm.register("purchase.amount", { valueAsNumber: true })}
                  type="text"
                  placeholder="Enter Amount"
                  className="w-full"
                  onInput={handleAmountInput}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      e.target.value = value.toFixed(2);
                      billsForm.setValue("purchase.amount", value);
                    }
                  }}
                />
                {billsForm.formState.errors.purchase?.amount && (
                  <p className="text-sm text-red-600">
                    {billsForm.formState.errors.purchase.amount?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number (optional)
                </label>
                <Input
                  {...billsForm.register("purchase.phoneNumber")}
                  type="text"
                  placeholder="Enter Phone Number"
                  className="w-full"
                  onInput={handlePhoneInput}
                />
                {billsForm.formState.errors.purchase?.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {billsForm.formState.errors.purchase.phoneNumber?.message}
                  </p>
                )}
              </div>

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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {/* FIX: Use safe document type getter */}
                  Upload {getDocumentTypeLabel("purchase")} Documents <span className="text-red-500">*</span>
                </label>
                <FileUploadField
                  name="purchaseFiles"
                  files={billsForm.watch('purchase.files')}
                  onFilesChange={handleBillsFilesChange("purchase")}
                  className={`min-h-[${UI_CONSTANTS.MIN_FILE_UPLOAD_HEIGHT}]`}
                  disabled={isUploading.purchase}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePurchaseBillSubmit}
                  disabled={
                    (isUpdate ? updateBillMutation.isPending : createPurchaseBillMutation.isPending) ||
                    isUploading.purchase ||
                    false
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {(isUpdate ? updateBillMutation.isPending : createPurchaseBillMutation.isPending)
                    ? (isUpdate ? "Updating..." : "Creating...")
                    : (isUpdate ? "Update Purchase Bill" : "Create Purchase Bill")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

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