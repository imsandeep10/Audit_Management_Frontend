import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { ClientFormSchema, type ClientFormData } from "../../schemas/clientValidation";
import { clientService } from "../../api/clientService";
import { prepareDateForBackend } from "../../utils/date-validation";
import { useGetClientById } from "../../api/useclient";
import z from "zod";
import { useGetAllEmployees } from "../../api/useEmployee";
import type { Employee } from "../../types/employees";
import { Step1, Step2, Step3, Step4 } from "./ClientFormSteps";
import { StepIndicator, NavigationButtons } from "./ClientFormComponents";

interface ClientFormProps {
  mode: "create" | "edit";
  clientId?: string;
  initialData?: Partial<ClientFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STEPS = {
  1: { fields: ["fullName", "email", "password", "DOB"] as (keyof ClientFormData)[] },
  2: { fields: ["address", "phoneNumber", "clientNature", "companyName", "registrationNumber", "clientType"] as (keyof ClientFormData)[] },
  3: { fields: ["IRDID", "irdPassword", "OCRID", "ocrPassword", "VCTSID", "vctsPassword"] as (keyof ClientFormData)[] },
  4: { fields: ["fillingperiod", "indexFileNumber", "IRDoffice", "auditFees", "extraCharges", "dateOfTaxRegistration", "dateOfVatRegistration", "dateOfExciseRegistration", "assignee"] as (keyof ClientFormData)[] },
};

const DATE_FIELDS = ["DOB", "dateOfTaxRegistration", "dateOfVatRegistration", "dateOfExciseRegistration"] as const;

const ClientForm: React.FC<ClientFormProps> = ({
  mode = "create",
  clientId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const params = useParams();
  const id = mode === "edit" ? params.id : undefined;
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [fillingPeriod, setFillingPeriod] = useState<"monthly" | "trimester">("monthly");

  const formRef = useRef<HTMLFormElement>(null);
  const lastFocusedRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data } = useGetClientById(id || "");
  const { data: assignees } = useGetAllEmployees();
  
  const ASSIGNEE_OPTIONS = useMemo(() => {
    if (!assignees?.data?.employees) return [];
    return assignees.data.employees
      .filter((assignee: Employee) => assignee.user)
      .map((assignee: Employee) => ({
        value: assignee._id,
        label: assignee.user.fullName,
        userId: assignee.user._id,
      }));
  }, [assignees]);

  const togglePassword = useCallback((field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const defaultValues = useMemo(() => ({
    fullName: "",
    email: "",
    password: mode === "edit" ? "" : "",
    DOB: "",
    profileImageId: "",
    address: "",
    phoneNumber: "",
    clientNature: "",
    companyName: "",
    registrationNumber: "",
    clientType: "",
    IRDID: "",
    irdPassword: "",
    OCRID: "",
    ocrPassword: "",
    VCTSID: "",
    vctsPassword: "",
    role: "client",
    status: "active",
    fillingperiod: "" as "monthly" | "trimester",
    indexFileNumber: "",
    IRDoffice: "",
    auditFees: "",
    extraCharges: "",
    dateOfTaxRegistration: "",
    dateOfVatRegistration: "",
    dateOfExciseRegistration: "",
  registeredUnder: initialData?.registeredUnder ?? "",
  ...initialData,
  assignee: Array.isArray(initialData?.assignee) ? initialData.assignee : (initialData?.assignee ? [initialData.assignee] : []),
  }), [initialData, mode]);

  const validationSchema = useMemo(() => {
    if (mode === "edit") {
      return ClientFormSchema.omit({ password: true, profileImageId: true }).extend({
        password: z.string().optional(),
        profileImageid: z.string().optional(),
      });
    }
    return ClientFormSchema;
  }, [mode]);

  const { register, handleSubmit, trigger, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const mappedEditData = useMemo(() => {
    if (mode === "edit" && data?.client) {
      const client = data.client;
  return {
        fullName: client.user?.fullName ?? "",
        email: client.user?.email ?? "",
        DOB: client.user?.DOB ? new Date(client.user.DOB).toISOString().split("T")[0] : "",
        address: client.user?.address ?? "",
        phoneNumber: client.user?.phoneNumber ?? "",
        profileImageId: client?.user?.profileImageId?._id?.toString() ?? client?.user?.profileImageId?.toString() ?? "",
        clientNature: client.clientNature ?? "",
        companyName: client.companyName ?? "",
        registrationNumber: client.registrationNumber ?? "",
        clientType: client.clientType ?? "",
        IRDID: client.IRDID ?? "",
        irdPassword: client.irdPassword ?? "",
        OCRID: client.OCRID ?? "",
        ocrPassword: client.ocrPassword ?? "",
        VCTSID: client.VCTSID ?? "",
        vctsPassword: client.vctsPassword ?? "",
        role: client.role ?? "client",
        status: client.status ?? "active",
        password: client.password ?? "",
        fillingperiod: (client.fillingperiod as "monthly" | "yearly" | "trimester") ?? "",
        indexFileNumber: client.indexFileNumber ?? "",
        IRDoffice: client.IRDoffice ?? "",
        auditFees: client.auditFees ? String(client.auditFees) : "",
        extraCharges: client.extraCharges ? String(client.extraCharges) : "",
        dateOfTaxRegistration: client.dateOfTaxRegistration ? new Date(client.dateOfTaxRegistration).toISOString().split("T")[0] : "",
        dateOfVatRegistration: client.dateOfVatRegistration ? new Date(client.dateOfVatRegistration).toISOString().split("T")[0] : "",
        dateOfExciseRegistration: client.dateOfExciseRegistration ? new Date(client.dateOfExciseRegistration).toISOString().split("T")[0] : "",
        registeredUnder: client.registeredUnder ?? "",
        assignee: Array.isArray(client.assignedEmployees) && client.assignedEmployees.length > 0
          ? client.assignedEmployees.map((assignedEmployee: any) => {
              if (assignedEmployee._id) return assignedEmployee._id.toString();
              return assignedEmployee.toString();
            }).filter(Boolean)
          : [],
      };
    }
    return null;
  }, [mode, data]);

  const updateFormValues = useCallback((dataToUpdate: Record<string, any>) => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.hasAttribute("name")) {
      lastFocusedRef.current = activeElement.getAttribute("name");
    }

    Object.entries(dataToUpdate).forEach(([key, value]) => {
      setValue(key as keyof ClientFormData, value, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
    });

    setIsDataLoaded(true);

    setTimeout(() => {
      if (lastFocusedRef.current && formRef.current) {
        const elementToFocus = formRef.current.querySelector(`[name="${lastFocusedRef.current}"]`) as HTMLElement;
        if (elementToFocus) elementToFocus.focus();
      }
    }, 50);
  }, [setValue]);

  useEffect(() => {
    if (mappedEditData && !isDataLoaded && assignees?.data?.employees) {
      updateFormValues(mappedEditData);
    } else if (mode === "edit" && initialData && !isDataLoaded && assignees?.data?.employees) {
      updateFormValues(initialData);
    }
  }, [mappedEditData, mode, initialData, updateFormValues, isDataLoaded, assignees]);

  const handleImageSelect = useCallback((imageId: string) => {
    setValue("profileImageId", imageId, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }, [setValue]);

  const clientMutation = useMutation({
    mutationFn: (data: ClientFormData) => {
      const updateId = clientId || id;
      if (mode === "edit") {
        if (!updateId) throw new Error("Client ID is required for updating.");
        const updateData = { ...data };
        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }
        return clientService.updateClient(updateId, updateData);
      } else {
        return clientService.createClient(data);
      }
    },
    onSuccess: () => {
      setIsProcessing(false);
      const action = mode === "edit" ? "updated" : "created";
      toast.success(`Client ${action} successfully!`);
      if (onSuccess) {
        onSuccess();
      } else {
        reset();
        setCurrentStep(1);
        setIsDataLoaded(false);
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        navigate("/clients");
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      let message = `Failed to ${mode} client. Please try again.`;
      if (error.message) message = error.message;
      if (error.message?.includes("route") || error.message?.includes("404")) {
        message = `API route not found. Please check your server configuration.`;
      }
      toast.error(message);
    },
  });

  const validateCurrentStep = useCallback(async () => {
    const currentFields = STEPS[currentStep as keyof typeof STEPS].fields;
    const isValid = await trigger(currentFields);
    if (!isValid) {
      toast.error("Please fix the errors before proceeding.");
      return false;
    }
    return true;
  }, [currentStep, trigger]);

  const handleNext = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const isValid = await validateCurrentStep();
      if (isValid && currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } catch {
      toast.error("Validation failed. Please check your inputs.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, validateCurrentStep, currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1 && !isProcessing) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, isProcessing]);

  const onSubmit = useCallback(async (data: ClientFormData) => {
    if (isProcessing || isSubmitting) return;
    setIsProcessing(true);
    try {
      const processedData = { ...data };
      DATE_FIELDS.forEach((field) => {
        if (processedData[field]) {
          processedData[field] = prepareDateForBackend(processedData[field]);
        }
      });
      await clientMutation.mutateAsync(processedData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  }, [isProcessing, isSubmitting, clientMutation]);

  const handleCancelClick = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      reset();
      setCurrentStep(1);
      setIsDataLoaded(false);
      navigate("/clients");
    }
  }, [onCancel, reset, navigate]);

  const handleFocus = useCallback(() => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.hasAttribute("name")) {
      lastFocusedRef.current = activeElement.getAttribute("name");
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto h-screen overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <h3 className="text-xl sm:text-3xl font-semibold text-gray-900 py-5">
        {mode === "edit" ? "Edit Client" : "Add Client"}
      </h3>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-30">
        <div className="p-4 sm:p-6 lg:p-8">
          <StepIndicator currentStep={currentStep} />
          <form
            ref={formRef}
            onSubmit={(e) => {
              if (currentStep === 4) {
                handleSubmit(onSubmit)(e);
              } else {
                e.preventDefault();
                handleNext();
              }
            }}
            className="space-y-10"
          >
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <Step1
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isProcessing={isProcessing}
                  showPassword={showPassword}
                  togglePassword={togglePassword}
                  handleImageSelect={handleImageSelect}
                  mode={mode}
                  data={data}
                  onFocus={handleFocus}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isProcessing={isProcessing}
                  onFocus={handleFocus}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isProcessing={isProcessing}
                  showPassword={showPassword}
                  togglePassword={togglePassword}
                  onFocus={handleFocus}
                />
              )}
              {currentStep === 4 && (
                <Step4
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isProcessing={isProcessing}
                  onFocus={handleFocus}
                  assigneeOptions={ASSIGNEE_OPTIONS}
                  fillingPeriod={fillingPeriod}
                  setFillingPeriod={setFillingPeriod}
                />
              )}
              <NavigationButtons
                currentStep={currentStep}
                isSubmitting={isSubmitting}
                isProcessing={isProcessing}
                handleCancelClick={handleCancelClick}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                mode={mode}
                handleSubmit={handleSubmit(onSubmit)}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;