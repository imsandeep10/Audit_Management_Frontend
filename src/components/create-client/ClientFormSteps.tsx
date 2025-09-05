import React from "react";
import DatePicker from "../date picker/date-picker";
import {
  InputField,
  PasswordField,
  MultiSelectField,
  ProfileImageSection,
} from "./ClientFormComponents";

// Step 1 Component
export const Step1: React.FC<{
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  showPassword: Record<string, boolean>;
  togglePassword: (field: string) => void;
  handleImageSelect: (imageId: string) => void;
  mode: "create" | "edit";
  data: any;
  onFocus: () => void;
}> = React.memo(({
  register,
  watch,
  setValue,
  errors,
  isSubmitting,
  isProcessing,
  showPassword,
  togglePassword,
  handleImageSelect,
  mode,
  data,
  onFocus,
}) => (
  <div className="space-y-6">
    <input {...register("profileImageId")} type="hidden" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        name="fullName"
        label="Full Name"
        type="text"
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <InputField
        name="email"
        label="Email"
        type="email"
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      {mode !== "edit" && (
        <PasswordField
          name="password"
          label="Password"
          register={register}
          errors={errors}
          showPassword={showPassword}
          togglePassword={togglePassword}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          required={true}
          onFocus={onFocus}
        />
      )}
      <div className="w-full">
        <DatePicker
          label="Date of Birth"
          required={false}
          id="DOB"
          value={watch("DOB") || ""}
          onChange={(value) =>
            setValue("DOB", value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            })
          }
          disabled={isSubmitting || isProcessing}
          convertToBS={true}
          minAge={18}
        />
        {errors.DOB && (
          <p className="text-red-500 text-sm mt-1">
            {errors.DOB?.message}
          </p>
        )}
      </div>
    </div>
    <ProfileImageSection
      mode={mode}
      data={data}
      handleImageSelect={handleImageSelect}
      isSubmitting={isSubmitting}
      isProcessing={isProcessing}
      errors={errors}
    />
  </div>
));

// Step 2 Component
export const Step2: React.FC<{
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  onFocus: () => void;
}> = React.memo(({
  register,
  watch,
  setValue,
  errors,
  isSubmitting,
  isProcessing,
  onFocus,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        name="address"
        label="Address"
        type="text"
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <InputField
        name="phoneNumber"
        label="Phone Number"
        type="text"
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <InputField
        name="clientNature"
        label="Client Nature"
        type="text"
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <InputField
        name="companyName"
        label="Company Name"
        type="text"
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <div className="md:col-span-2">
        <InputField
          name="registrationNumber"
          label="Company Registration Number"
          required={false}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          onFocus={onFocus}
        />
      </div>
      <div className="md:col-span-2">
        <InputField
          name="clientType"
          label="Client Type"
          type="text"
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          onFocus={onFocus}
        />
      </div>
    </div>
  </div>
));

// Step 3 Component - All fields now optional
export const Step3: React.FC<{
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  showPassword: Record<string, boolean>;
  togglePassword: (field: string) => void;
  onFocus: () => void;
}> = React.memo(({
  register,
  watch,
  setValue,
  errors,
  isSubmitting,
  isProcessing,
  showPassword,
  togglePassword,
  onFocus,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        name="IRDID"
        label="IRD ID"
        required={false}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <PasswordField
        name="irdPassword"
        label="IRD Password"
        required={false}
        register={register}
        errors={errors}
        showPassword={showPassword}
        togglePassword={togglePassword}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <InputField
        name="OCRID"
        label="OCR ID"
        required={false}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <PasswordField
        name="ocrPassword"
        label="OCR Password"
        required={false}
        register={register}
        errors={errors}
        showPassword={showPassword}
        togglePassword={togglePassword}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <InputField
        name="VCTSID"
        label="VCTS ID"
        required={false}
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
      <PasswordField
        name="vctsPassword"
        label="VCTS Password"
        required={false}
        register={register}
        errors={errors}
        showPassword={showPassword}
        togglePassword={togglePassword}
        isSubmitting={isSubmitting}
        isProcessing={isProcessing}
        onFocus={onFocus}
      />
    </div>
  </div>
));

// Step 4 Component - Updated to handle assignee display properly
export const Step4: React.FC<{
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  isProcessing: boolean;
  onFocus: () => void;
  assigneeOptions: { value: string; label: string }[];
  fillingPeriod: 'monthly' | 'trimester';
  setFillingPeriod: (period: 'monthly' | 'trimester') => void;
}> = React.memo(({
  register,
  watch,
  setValue,
  errors,
  isSubmitting,
  isProcessing,
  onFocus,
  assigneeOptions,
  fillingPeriod,
  setFillingPeriod,
}) => {
  // Watch the assignee field to get current selected values
  const selectedAssignees = watch("assignee") || [];

  // Sync fillingPeriod state with form value on mount (for edit mode)
  React.useEffect(() => {
    const watchedPeriod = watch("fillingperiod");
    if (watchedPeriod && watchedPeriod !== fillingPeriod) {
      setFillingPeriod(watchedPeriod);
    }
  }, [watch, fillingPeriod, setFillingPeriod]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filling Period</label>
          <div className="flex gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-md border transition-colors ${fillingPeriod === 'monthly' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              onClick={() => { 
                setFillingPeriod('monthly'); 
                setValue('fillingperiod', 'monthly', { 
                  shouldValidate: true, 
                  shouldDirty: true, 
                  shouldTouch: true 
                }); 
              }}
              disabled={isSubmitting || isProcessing}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md border transition-colors ${fillingPeriod === 'trimester' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              onClick={() => { 
                setFillingPeriod('trimester'); 
                setValue('fillingperiod', 'trimester', { 
                  shouldValidate: true, 
                  shouldDirty: true, 
                  shouldTouch: true 
                }); 
              }}
              disabled={isSubmitting || isProcessing}
            >
              Trimester
            </button>
          </div>
          {errors.fillingperiod && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fillingperiod?.message}
            </p>
          )}
        </div>
        
        <InputField
          name="indexFileNumber"
          label="Index File Number"
          type="text"
          required={false}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          onFocus={onFocus}
        />
        
        <InputField
          name="IRDoffice"
          label="IRD Office"
          type="text"
          required={false}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          onFocus={onFocus}
        />
        
        <InputField
          name="auditFees"
          label="Audit Fees"
          type="number"
          required={false}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          onFocus={onFocus}
        />
        
        <InputField
          name="extraCharges"
          label="Extra Charges"
          type="number"
          required={false}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          isProcessing={isProcessing}
          onFocus={onFocus}
        />

        <div className="w-full">
          <label htmlFor="registeredUnder" className="block text-sm font-medium text-gray-700 mb-1">
            Client Registered Under
          </label>
          <select
            id="registeredUnder"
            {...register("registeredUnder")}
            className="border rounded-md px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting || isProcessing}
          >
            <option value="">Select</option>
            <option value="vat">VAT</option>
            <option value="pan">PAN</option>
          </select>
          {errors.registeredUnder && (
            <p className="text-red-500 text-sm mt-1">{errors.registeredUnder?.message}</p>
          )}
        </div>
        
        <div className="w-full">
          <DatePicker
            label="Date of Tax Registration"
            required={false}
            id="dateOfTaxRegistration"
            value={watch("dateOfTaxRegistration") || ""}
            onChange={(value) =>
              setValue("dateOfTaxRegistration", value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            disabled={isSubmitting || isProcessing}
            convertToBS={true}
          />
          {errors.dateOfTaxRegistration && (
            <p className="text-red-500 text-sm mt-1">
              {errors.dateOfTaxRegistration?.message}
            </p>
          )}
        </div>
        
        <div className="w-full">
          <DatePicker
            label="Date of VAT Registration"
            required={false}
            id="dateOfVatRegistration"
            value={watch("dateOfVatRegistration") || ""}
            onChange={(value) =>
              setValue("dateOfVatRegistration", value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            disabled={isSubmitting || isProcessing}
            convertToBS={true}
          />
          {errors.dateOfVatRegistration && (
            <p className="text-red-500 text-sm mt-1">
              {errors.dateOfVatRegistration?.message}
            </p>
          )}
        </div>
        
        <div className="w-full">
          <DatePicker
            label="Date of Excise Registration"
            required={false}
            id="dateOfExciseRegistration"
            value={watch("dateOfExciseRegistration") || ""}
            onChange={(value) =>
              setValue("dateOfExciseRegistration", value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            disabled={isSubmitting || isProcessing}
            convertToBS={true}
          />
          {errors.dateOfExciseRegistration && (
            <p className="text-red-500 text-sm mt-1">
              {errors.dateOfExciseRegistration?.message}
            </p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <MultiSelectField
            name="assignee"
            label="Assignees"
            options={assigneeOptions}
            required={false}
            errors={errors}
            watch={watch}
            setValue={setValue}
            isSubmitting={isSubmitting}
            isProcessing={isProcessing}
            onFocus={onFocus}
          />
          
          {selectedAssignees.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Assignees:</p>
              <div className="flex flex-wrap gap-2">
                {selectedAssignees.map((assigneeId: string) => {
                  const assignee = assigneeOptions.find(option => option.value === assigneeId);
                  return (
                    <span 
                      key={assigneeId} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {assignee ? assignee.label : `ID: ${assigneeId}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});