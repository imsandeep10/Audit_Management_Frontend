import { useEffect, useState, useCallback, useMemo } from "react";
import { useCreateAmount, useGetAmountsbyTaskId, useUpdateAmount } from "../../api/useclient";
import DatePicker from "../../components/date picker/date-picker";
import { Save, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/button";

// Types
export interface ClientAmount {
  id: string;
  clientId: string;
  clientName: string;
  vatableSales: number;
  vatFreeSales: number;
  vatablePurchase: number;
  customPurchase: number;
  vatFreePurchase: number;
  creditRemainingBalance: number;
  recordedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Client {
  _id: string;
  companyName: string;
  clientNature?: string;
  registrationNumber?: string;
}

export interface TaskWithDetails {
  _id: string;
  taskTitle: string;
  taskType: string;
  client: Client[];
  amounts?: ClientAmount[];
  [key: string]: any;
}

interface AmountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amounts: ClientAmount[]) => Promise<void> | void;
  task: TaskWithDetails;
}

// Move AmountField outside component to prevent re-creation
const AmountField = ({ 
  label, 
  value, 
  onChange, 
  disabled = false 
}: { 
  label: string; 
  value: number; 
  onChange: (value: string) => void; 
  disabled?: boolean; 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <span className="absolute pr-5 left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        NRs
      </span>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="0.00"
        step="0.01"
        min="0"
        disabled={disabled}
      />
    </div>
  </div>
);

const AmountDialog = ({
  isOpen,
  onClose,
  onSave,
  task
}: AmountDialogProps) => {
  const [clientAmounts, setClientAmounts] = useState<ClientAmount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const createAmountMutation = useCreateAmount();
  const updateAmountMutation = useUpdateAmount();
  const { data: existingAmountsResponse } = useGetAmountsbyTaskId(task._id, { enabled: isOpen });

  const existingAmountsByClientId = useMemo(() => {
    // Normalize API response to an array of records
    const list = Array.isArray(existingAmountsResponse)
      ? (existingAmountsResponse as any[])
      : Array.isArray((existingAmountsResponse as any)?.maskebariRecords)
      ? ((existingAmountsResponse as any).maskebariRecords as any[])
      : Array.isArray((existingAmountsResponse as any)?.data)
      ? ((existingAmountsResponse as any).data as any[])
      : [];

    const map = new Map<string, any>();
    for (const item of list) {
      // Support both object and string clientId forms, and fallback to client field
      const rawClientId: any = (item as any)?.clientId ?? (item as any)?.client;
      const clientIdStr: string | undefined =
        (typeof rawClientId === 'object' && rawClientId?._id)
          ? String(rawClientId._id)
          : (typeof rawClientId === 'string')
          ? rawClientId
          : (item as any)?.client?._id
          ? String((item as any).client._id)
          : undefined;

      if (clientIdStr) {
        map.set(clientIdStr, item);
      }
    }
    return map;
  }, [existingAmountsResponse]);

  // Optimized with proper dependencies
  const handleAmountChange = useCallback((index: number, field: keyof ClientAmount, value: string) => {
    setClientAmounts(prev => {
      const updatedAmounts = [...prev];
      if (field === 'recordedDate') {
        updatedAmounts[index] = {
          ...updatedAmounts[index],
          [field]: value
        };
      } else {
        updatedAmounts[index] = {
          ...updatedAmounts[index],
          [field]: parseFloat(value) || 0
        };
      }
      return updatedAmounts;
    });
  }, []); // No dependencies needed since we use functional state updates

  const handleDateChange = useCallback((index: number, date: string) => {
    setClientAmounts(prev => {
      const updatedAmounts = [...prev];
      updatedAmounts[index] = {
        ...updatedAmounts[index],
        recordedDate: date
      };
      return updatedAmounts;
    });
  }, []); // No dependencies needed since we use functional state updates

  const removeClientAmount = useCallback((index: number) => {
    setClientAmounts(prev => prev.filter((_, i) => i !== index));
  }, []); // No dependencies needed since we use functional state updates

  // Add useCallback for error handling
  const handleError = useCallback((error: any) => {
    console.error('Error saving amounts:', error);
    // You might want to show an error toast here
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use all clientAmounts, or filter as needed for your business logic
      for (const amount of clientAmounts) {
        const payload = {
          maskebariDate: amount.recordedDate,
          vatableSales: amount.vatableSales || 0,
          vatFreeSales: amount.vatFreeSales || 0,
          vatablePurchase: amount.vatablePurchase || 0,
          customPurchase: amount.customPurchase || 0,
          vatFreePurchase: amount.vatFreePurchase || 0,
          creditRemainingBalance: amount.creditRemainingBalance || 0,
          clientId: amount.clientId,
          taskId: task._id,
        };
        const hasExisting = existingAmountsByClientId.has(amount.clientId);
        if (hasExisting) {
          await updateAmountMutation.mutateAsync(payload);
        } else {
          await createAmountMutation.mutateAsync(payload);
        }
      }

      await onSave(clientAmounts);
      handleClose();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    clientAmounts, 
    createAmountMutation, 
    updateAmountMutation, 
    existingAmountsByClientId, 
    onSave, 
    task._id,
    handleError
  ]); // Added handleError and task._id as dependencies

  const handleClose = useCallback(() => {
    setClientAmounts([]);
    onClose();
  }, [onClose]);

  // Create memoized client amount creation function
  const createClientAmount = useCallback((client: Client, existing: any) => {
    const existingDate: string | undefined = existing?.maskebariDate || existing?.recordedDate;
    return {
      id: `client-${client._id}`,
      clientId: client._id,
      clientName: client.companyName,
      vatableSales: Number(existing?.vatableSales ?? 0),
      vatFreeSales: Number(existing?.vatFreeSales ?? 0),
      vatablePurchase: Number(existing?.vatablePurchase ?? 0),
      customPurchase: Number(existing?.customPurchase ?? 0),
      vatFreePurchase: Number(existing?.vatFreePurchase ?? 0),
      creditRemainingBalance: Number(existing?.creditRemainingBalance ?? 0),
      recordedDate: (existingDate ? String(existingDate).slice(0, 10) : new Date().toISOString().split('T')[0]),
    } as ClientAmount;
  }, []);

  // Create memoized amount field change handlers for each client
  const createAmountFieldChangeHandler = useCallback((index: number, field: keyof ClientAmount) => {
    return (value: string) => handleAmountChange(index, field, value);
  }, [handleAmountChange]);

  const createDateChangeHandler = useCallback((index: number) => {
    return (date: string) => handleDateChange(index, date);
  }, [handleDateChange]);

  const createRemoveHandler = useCallback((index: number) => {
    return () => removeClientAmount(index);
  }, [removeClientAmount]);

  useEffect(() => {
    if (isOpen && task.client) {
      const mappedAmounts = task.client.map((client) => {
        const existing = existingAmountsByClientId.get(String(client._id)) as any;
        return createClientAmount(client, existing);
      });
      setClientAmounts(mappedAmounts);
    }
  }, [isOpen, task.client, existingAmountsByClientId, createClientAmount]);

  // Memoize handlers array to prevent unnecessary re-renders
  const clientHandlers = useMemo(() => {
    return clientAmounts.map((_, index) => ({
      onAmountChange: createAmountFieldChangeHandler,
      onDateChange: createDateChangeHandler(index),
      onRemove: createRemoveHandler(index)
    }));
  }, [clientAmounts.length, createAmountFieldChangeHandler, createDateChangeHandler, createRemoveHandler]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Add Amounts - {task.taskTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Task Type: {task.taskType?.charAt(0).toUpperCase() + task.taskType?.slice(1)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Amounts */}
          <div className="space-y-6">
            {clientAmounts.map((amount, index) => (
              <div key={amount.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {amount.clientName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Client ID: {amount.clientId}
                    </p>
                  </div>
                  
                  {clientAmounts.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={clientHandlers[index]?.onRemove}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Date Picker */}
                <div className="mb-6">
                  <div className="max-w-xs">
                    <DatePicker
                      label="Recorded Date"
                      value={amount.recordedDate}
                      onChange={clientHandlers[index]?.onDateChange}
                      required
                      type="dialog"
                    />
                  </div>
                </div>

                {/* Sales Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Sales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AmountField
                      label="Vatable Sales"
                      value={amount.vatableSales}
                      onChange={clientHandlers[index]?.onAmountChange(index, 'vatableSales')}
                      disabled={isLoading}
                    />
                    <AmountField
                      label="VAT Free Sales"
                      value={amount.vatFreeSales}
                      onChange={clientHandlers[index]?.onAmountChange(index, 'vatFreeSales')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Purchase Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Purchases</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AmountField
                      label="Vatable Purchase"
                      value={amount.vatablePurchase}
                      onChange={clientHandlers[index]?.onAmountChange(index, 'vatablePurchase')}
                      disabled={isLoading}
                    />
                    <AmountField
                      label="Custom Purchase"
                      value={amount.customPurchase}
                      onChange={clientHandlers[index]?.onAmountChange(index, 'customPurchase')}
                      disabled={isLoading}
                    />
                    <AmountField
                      label="VAT Free Purchase"
                      value={amount.vatFreePurchase}
                      onChange={clientHandlers[index]?.onAmountChange(index, 'vatFreePurchase')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Credit Balance Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-4 border-b pb-2">Balance Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Remaining Balance
                      </label>
                      <div className="relative">
                        <span className="absolute pr-3 left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          NRs
                        </span>
                        <input
                          type="number"
                          value={amount.creditRemainingBalance || ''}
                          onChange={(e) => handleAmountChange(index, 'creditRemainingBalance', e.target.value)}
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total for this client */}
             
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={clientAmounts.length === 0 || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Amounts'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AmountDialog;