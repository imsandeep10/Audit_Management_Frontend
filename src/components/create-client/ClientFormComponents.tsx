import React from "react";
import { Eye, EyeOff, X } from "lucide-react";
import DatePicker from "../date picker/date-picker";
import { UploadImage } from "../ui/uploadImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ClientFormData } from "../../schemas/clientValidation";

// Filling period options - Fixed typo: trismester -> trimester
export const FILLING_PERIOD_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "trimester", label: "Trimester" },
];

// Client type options
export const CLIENT_TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "partnership", label: "Partnership" },
  { value: "trust", label: "Trust" },
];

// Password fields configuration
export const PASSWORD_FIELDS = [
  { name: "password", label: "Password" },
  { name: "irdPassword", label: "IRD Password" },
  { name: "ocrPassword", label: "OCR Password" },
  { name: "vctsPassword", label: "VCTS Password" },
];

// Step Indicator Component
export const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const STEPS = {
    1: { fields: ["fullName", "email", "password", "DOB"] },
    2: { fields: ["address", "phoneNumber", "clientNature", "companyName", "registrationNumber", "clientType"] },
    3: { fields: ["IRDID", "irdPassword", "OCRID", "ocrPassword", "VCTSID", "vctsPassword"] },
    4: { fields: ["fillingperiod", "indexFileNumber", "IRDoffice", "auditFees", "extraCharges", "dateOfTaxRegistration", "dateOfVatRegistration", "dateOfExciseRegistration", "assignee"] },
  };

  return (
    <div className="w-full mb-6 sm:mb-8">
      {/* Mobile Step Indicator */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of 4
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden sm:flex items-center justify-center">
        <div className="flex items-center space-x-4 pb-2">
          {Object.entries(STEPS).map(([step], index) => {
            const stepNum = parseInt(step);
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                  <div
                    className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 text-sm lg:text-base shadow-lg ${
                      isCompleted
                        ? "bg-green-600 shadow-green-200"
                        : isCurrent
                        ? "bg-blue-600 shadow-blue-200 scale-110"
                        : "bg-gray-400 shadow-gray-200"
                    }`}
                  >
                    {isCompleted ? "✓" : stepNum}
                  </div>
                </div>
                {index < Object.keys(STEPS).length - 1 && (
                  <div
                    className={`w-8 lg:w-16 h-1 rounded-full mt-4 transition-colors ${
                      isCompleted ? "bg-green-400" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Input Field Component
export const InputField: React.FC<{
  name: keyof ClientFormData;
  label: string;
  type?: string;
  required?: boolean;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  onFocus?: () => void;
}> = React.memo(({
  name,
  label,
  type = "text",
  required = true,
  register,
  errors,
  watch,
  setValue,
  isSubmitting,
  isProcessing,
  onFocus,
}) => {
  const DATE_FIELDS = [
    "DOB",
    "dateOfTaxRegistration",
    "dateOfVatRegistration",
    "dateOfExciseRegistration",
  ] as const;

  const isDateField = DATE_FIELDS.includes(
    name as (typeof DATE_FIELDS)[number]
  );
  const inputType = isDateField ? "date" : type;

  return (
    <div className="w-full">
      {isDateField ? (
        <>
          <DatePicker
            label={label}
            required={required}
            id={name as string}
            value={watch(name) || ""}
            onChange={(value) =>
              setValue(name, value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            disabled={isSubmitting || isProcessing}
            convertToBS={true}
            minAge={name === "DOB" ? 18 : 0}
          />
          {errors[name] && (
            <p className="text-red-500 text-sm mt-1">
              {errors[name]?.message}
            </p>
          )}
        </>
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={inputType}
            {...register(name, {
              onChange: () => {
                onFocus?.();
              },
            })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm sm:text-base"
            disabled={isSubmitting || isProcessing}
            onFocus={onFocus}
          />
          {errors[name] && (
            <p className="text-red-500 text-sm mt-1">
              {errors[name]?.message}
            </p>
          )}
        </>
      )}
    </div>
  );
});

// Password Field Component
export const PasswordField: React.FC<{
  name: keyof ClientFormData;
  label: string;
  register: any;
  errors: any;
  showPassword: Record<string, boolean>;
  togglePassword: (field: string) => void;
  isSubmitting: boolean;
  isProcessing: boolean;
  required?: boolean;
  onFocus?: () => void;
}> = React.memo(({
  name,
  label,
  register,
  errors,
  showPassword,
  togglePassword,
  isSubmitting,
  isProcessing,
  required = true,
  onFocus,
}) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={showPassword[name] ? "text" : "password"}
      {...register(name, {
        onChange: () => {
          onFocus?.();
        },
      })}
      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm sm:text-base"
      disabled={isSubmitting || isProcessing}
      onFocus={onFocus}
    />
    <button
      type="button"
      onClick={() => togglePassword(name)}
      aria-label={
        showPassword[name] ? "Hide password" : "Show password"
      }
      className="absolute top-10 right-2 px-3"
    >
      {showPassword[name] ? (
        <Eye size={20} />
      ) : (
        <EyeOff size={20} />
      )}
    </button>
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">
        {errors[name]?.message}
      </p>
    )}
  </div>
));

// Select Field Component - Fixed to properly handle value changes
export const SelectField: React.FC<{
  name: keyof ClientFormData;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  errors: any;
  watch: any;
  setValue: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  onFocus?: () => void;
}> = React.memo(({
  name,
  label,
  options,
  required = true,
  errors,
  watch,
  setValue,
  isSubmitting,
  isProcessing,
  onFocus,
}) => {
  const currentValue = watch(name);
  
  // Ensure we're working with a string value
  const stringValue = currentValue ? String(currentValue) : "";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select
        value={stringValue}
        onValueChange={(value) => {
          setValue(name, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          onFocus?.();
        }}
        disabled={isSubmitting || isProcessing}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`}>
            {options.find(opt => opt.value === stringValue)?.label || ""}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
});

// Multi-Select Field Component for Assignees - Fixed to handle array properly



export const MultiSelectField: React.FC<{
  name: keyof ClientFormData;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  errors: any;
  watch: any;
  setValue: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  onFocus?: () => void;
}> = React.memo(({
  name,
  label,
  options,
  required = true,
  errors,
  watch,
  setValue,
  isSubmitting,
  isProcessing,
  onFocus,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Force re-render by subscribing to the field value
  const currentValues = watch(name) || [];
  
  // Use a separate state to track selected values for better control
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  
  // Normalize current values without useMemo inside useEffect
  const normalizedValues = React.useMemo(() => {
    if (Array.isArray(currentValues)) {
      return currentValues.map(v => String(v));
    }
    return currentValues ? [String(currentValues)] : [];
  }, [currentValues]);

  // Update local state when form value changes
  React.useEffect(() => {
    setSelectedValues(normalizedValues);
  }, [normalizedValues]);

  const handleToggleOption = React.useCallback((optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    
    // Update both local state and form state
    setSelectedValues(newValues);
    setValue(name, newValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    onFocus?.();
  }, [selectedValues, setValue, name, onFocus]);

  const handleRemoveValue = React.useCallback((valueToRemove: string) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    
    // Update both local state and form state
    setSelectedValues(newValues);
    setValue(name, newValues, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    onFocus?.();
  }, [selectedValues, setValue, name, onFocus]);

  const getSelectedLabels = React.useCallback(() => {
    return selectedValues.map(value => {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    });
  }, [selectedValues, options]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.multi-select-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="w-full multi-select-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Selected values display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {getSelectedLabels().map((label, index) => (
            <span
              key={`${selectedValues[index]}-${index}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {label}
              <button
                type="button"
                onClick={() => handleRemoveValue(selectedValues[index])}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                disabled={isSubmitting || isProcessing}
                aria-label={`Remove ${label}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Multi-select dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSubmitting || isProcessing}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 text-sm sm:text-base bg-white text-left flex items-center justify-between"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-gray-500 truncate">
            {selectedValues.length > 0 
              ? `${selectedValues.length} selected` 
              : `Select ${label.toLowerCase()}`
            }
          </span>
          <svg 
            className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleToggleOption(option.value)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting || isProcessing}
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
      
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
});

MultiSelectField.displayName = 'MultiSelectField';

MultiSelectField.displayName = 'MultiSelectField';
// Profile Image Component
export const ProfileImageSection: React.FC<{
  mode: "create" | "edit";
  data: any;
  handleImageSelect: (imageId: string) => void;
  isSubmitting: boolean;
  isProcessing: boolean;
  errors: any;
}> = React.memo(({
  mode,
  data,
  handleImageSelect,
  isSubmitting,
  isProcessing,
  errors,
}) => (
  <div className="mt-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Profile Image
    </label>
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
      {mode === "edit" &&
      data &&
      data?.client &&
      data?.client?.user?.profileImageId &&
      data?.client?.user?.profileImageId.url ? (
        <img
          src={data?.client?.user?.profileImageId.url}
          alt={
            data?.client?.user?.profileImageId.originalName || "Profile"
          }
          className="w-full sm:h-24 border-2 border-gray-300 shadow-sm"
        />
      ) : null}
      {mode !== "edit" && (
        <div className="w-full">
          <UploadImage
            onImageSelect={handleImageSelect}
            disabled={isSubmitting || isProcessing}
            placeholder="Upload image"
            maxSize={10}
          />
        </div>
      )}
    </div>
    {errors.profileImageId && (
      <p className="text-red-500 text-sm mt-1">
        {errors.profileImageId.message}
      </p>
    )}
  </div>
));

// Navigation Buttons Component
export const NavigationButtons: React.FC<{
  currentStep: number;
  isSubmitting: boolean;
  isProcessing: boolean;
  handleCancelClick: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  mode: "create" | "edit";
  handleSubmit?: () => void;
}> = React.memo(({
  currentStep,
  isSubmitting,
  isProcessing,
  handleCancelClick,
  handleNext,
  handlePrevious,
  mode,
  handleSubmit,
}) => {
  if (currentStep === 1) {
    return (
      <div className="flex gap-4 justify-between pb-24 pt-8">
        <button
          type="button"
          onClick={handleCancelClick}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          disabled={isSubmitting || isProcessing}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          disabled={isSubmitting || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Validating...
            </>
          ) : (
            <>Next</>
          )}
        </button>
      </div>
    );
  }

  if (currentStep === 2 || currentStep === 3) {
    return (
      <div className="flex gap-4 justify-between pt-4">
        <button
          type="button"
          onClick={handlePrevious}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          disabled={isSubmitting || isProcessing}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          disabled={isSubmitting || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Validating...
            </>
          ) : (
            <>Next</>
          )}
        </button>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="flex gap-4 justify-between pb-24 pt-8">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handlePrevious}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            disabled={isSubmitting || isProcessing}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleCancelClick}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            disabled={isSubmitting || isProcessing}
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors font-medium"
          disabled={isSubmitting || isProcessing}
        >
          {isSubmitting || isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === "edit" ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
              {mode === "edit" ? "Update Client" : "Save Client"}
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
});