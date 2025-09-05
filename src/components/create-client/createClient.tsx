import React, { useState, type JSX } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  ClientFormSchema,
  type ClientFormData,
} from "../../schemas/clientValidation";
import { clientService } from "../../api/clientService";
import { AxiosError } from "axios";
import { UploadImage } from "../ui/uploadImage";
import type {
  ValidationError,
  ServerErrorResponse,
  ClientCreationResponse,
} from "../../types/api";

const useStepValidation = () => {
  const getFieldsForStep = (step: number): (keyof ClientFormData)[] => {
    switch (step) {
      case 1:
        return ["fullName", "email", "password", "DOB"];
      case 2:
        return [
          "address",
          "phoneNumber",
          "clientNature",
          "companyName",
          "registrationNumber",
        ];
      case 3:
        return [
          "IRDID",
          "irdPassword",
          "OCRID",
          "ocrPassword",
          "VCTSID",
          "vctsPassword",
        ];
      default:
        return [];
    }
  };

  return { getFieldsForStep };
};

const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 1) {
    return errors[0].message;
  }

  return errors
    .map((error, index) => `${index + 1}. ${error.message}`)
    .join("\n");
};

const handleServerError = (error: AxiosError<ServerErrorResponse>): string => {
  const serverResponse = error.response?.data;

  if (!serverResponse) {
    return `Network error: ${error.message}`;
  }

  if (
    error.response?.status === 400 &&
    serverResponse.errors &&
    serverResponse.errors.length > 0
  ) {
    return formatValidationErrors(serverResponse.errors);
  }

  if (
    serverResponse.message &&
    serverResponse.message !== "Validation failed"
  ) {
    return serverResponse.message;
  }

  return `Server error (${error.response?.status}): ${error.message}`;
};

const CreateClient: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { getFieldsForStep } = useStepValidation();

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    setValue,
    setError,
    formState: { errors, isLoading },
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      DOB: "",
      profileImageId: "",
      address: "",
      phoneNumber: "",
      clientNature: "",
      companyName: "",
      registrationNumber: "",
      IRDID: "",
      irdPassword: "",
      OCRID: "",
      ocrPassword: "",
      VCTSID: "",
      vctsPassword: "",
      role: "client",
      status: "active",
      fillingperiod: "",
      indexFileNumber: "",
      IRDoffice: "",
      auditFees: "",
      extraCharges: "",
      dateOfTaxRegistration: "",
      dateOfVatRegistration: "",
      dateOfExciseRegistration: "",
    },
    mode: "onBlur",
  });

  const handleImageSelect = (imageId: string) => {
    setValue("profileImageId", imageId);
  };

  const createClientMutation = useMutation({
    mutationFn: clientService.createClient,
    onSuccess: (data: ClientCreationResponse) => {
      if (
        data.message === "user created sucessfully" ||
        data.user ||
        data.client
      ) {
        toast.success("Client created successfully!");
        reset();
        setCurrentStep(1);
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        navigate("/clients");
      } else {
        toast.error("Failed to create client. Please try again.");
      }
    },
    onError: (error: AxiosError<ServerErrorResponse>) => {
      console.error("Client creation error:", error);

      const errorMessage = handleServerError(error);
      toast.error(errorMessage);

      const serverResponse = error.response?.data;
      if (serverResponse?.errors) {
        serverResponse.errors.forEach((validationError) => {
          const fieldName = validationError.field as keyof ClientFormData;
          if (fieldName) {
            setError(fieldName, {
              type: "server",
              message: validationError.message,
            });
          }
        });
      }
    },
  });

  const handleNext = async (): Promise<void> => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast.error("Please fix the errors before proceeding.");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const onSubmit: SubmitHandler<ClientFormData> = async (
    data: ClientFormData
  ): Promise<void> => {
    try {
      await createClientMutation.mutateAsync(data);
    } catch (error) {
      console.error("Final submission error:", error);
    }
  };

  const handleCancel = (): void => {
    if (isLoading) return;

    reset();
    setCurrentStep(1);
    navigate("/clients");
  };

  const handlePrevious = (): void => {
    if (currentStep > 1 && !isLoading) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const renderStepIndicator = (): JSX.Element => (
    <div className="flex items-center justify-around space-x-8 mb-8">
      {([1, 2, 3] as const).map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${
                isCompleted || isCurrent ? "bg-blue-600" : "bg-gray-400"
              }`}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = (): JSX.Element => (
    <div className="space-y-6">
      <input type="hidden" {...register("profileImageId")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("fullName")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email:<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password:<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth:<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("DOB")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.DOB && (
            <p className="text-red-500 text-sm mt-1">{errors.DOB.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Upload:<span className="text-red-500">*</span>
          </label>
          <UploadImage
            onImageSelect={handleImageSelect}
            disabled={isLoading}
            placeholder="upload image"
            maxSize={5}
          />
          {errors.profileImageId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.profileImageId.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("address")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone:<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register("phoneNumber")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Nature:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("clientNature")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.clientNature && (
            <p className="text-red-500 text-sm mt-1">
              {errors.clientNature.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("companyName")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Registration Number:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("registrationNumber")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.registrationNumber && (
            <p className="text-red-500 text-sm mt-1">
              {errors.registrationNumber.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IRD ID:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("IRDID")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.IRDID && (
            <p className="text-red-500 text-sm mt-1">{errors.IRDID.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IRD Password:<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("irdPassword")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.irdPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.irdPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OCR ID:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("OCRID")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.OCRID && (
            <p className="text-red-500 text-sm mt-1">{errors.OCRID.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OCR Password:<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("ocrPassword")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.ocrPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.ocrPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            VCTS ID:<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("VCTSID")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.VCTSID && (
            <p className="text-red-500 text-sm mt-1">{errors.VCTSID.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            VCTS Password:<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("vctsPassword")}
            className="w-full px-3 py-2.5 border-b-2 border-r shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.vctsPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.vctsPassword.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white h-screen overflow-hidden">
      <h3 className="text-2xl font-semibold p-7">Add Client</h3>
      <div className="max-w-7xl mx-auto p-6 card-custom rounded-lg shadow-sm h-[75vh]">
        {renderStepIndicator()}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between pt-6">
            <div>
              {(currentStep === 1 || currentStep === 3) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="space-x-3 flex justify-between items-center">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={createClientMutation.isPending}
                >
                  Next{" "}
                  {createClientMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  ) : null}
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Client...
                    </>
                  ) : (
                    "Create Client"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClient;
