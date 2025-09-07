import { useEffect, useState, useCallback, useMemo } from "react";
import { useCreateAmount } from "../../api/useclient";
import DatePicker from "../../components/date picker/date-picker";
import { Plus, Save, Trash2, X } from "lucide-react";
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

  // Use useCallback to prevent function recreation on every render
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
  }, []);

  const handleDateChange = useCallback((index: number, date: string) => {
    setClientAmounts(prev => {
      const updatedAmounts = [...prev];
      updatedAmounts[index] = {
        ...updatedAmounts[index],
        recordedDate: date
      };
      return updatedAmounts;
    });
  }, []);

  const addNewClientAmount = useCallback(() => {
    // Find clients that don't have amounts yet
    const existingClientIds = clientAmounts.map(ca => ca.clientId);
    const availableClients = task.client?.filter(client => !existingClientIds.includes(client._id)) || [];
    
    if (availableClients.length > 0) {
      const newAmount: ClientAmount = {
        id: `new-${Date.now()}`,
        clientId: availableClients[0]._id,
        clientName: availableClients[0].companyName,
        vatableSales: 0,
        vatFreeSales: 0,
        vatablePurchase: 0,
        customPurchase: 0,
        vatFreePurchase: 0,
        creditRemainingBalance: 0,
        recordedDate: new Date().toISOString().split('T')[0]
      };
      setClientAmounts(prev => [...prev, newAmount]);
    }
  }, [clientAmounts, task.client]);

  const removeClientAmount = useCallback((index: number) => {
    setClientAmounts(prev => prev.filter((_, i) => i !== index));
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
        await createAmountMutation.mutateAsync(payload);
      }

      await onSave(clientAmounts);
      handleClose();
    } catch (error) {
      console.error('Error saving amounts:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  }, [clientAmounts, createAmountMutation, onSave]);

  const handleClose = useCallback(() => {
    setClientAmounts([]);
    onClose();
  }, [onClose]);

  const getTotalAmount = useCallback((amount: ClientAmount) => {
    return (
      (amount.vatableSales || 0) +
      (amount.vatFreeSales || 0) +
      (amount.vatablePurchase || 0) +
      (amount.customPurchase || 0) +
      (amount.vatFreePurchase || 0) +
      (amount.creditRemainingBalance || 0)
    );
  }, []);

  const grandTotal = useMemo(() => {
    return clientAmounts.reduce((total, amount) => total + getTotalAmount(amount), 0);
  }, [clientAmounts, getTotalAmount]);

  useEffect(() => {
    if (isOpen && task.client) {
      // Create fresh amounts for each client with default values
      const mappedAmounts = task.client.map((client) => ({
        id: `client-${client._id}`, // Use client ID for stable key
        clientId: client._id,
        clientName: client.companyName,
        vatableSales: 0,
        vatFreeSales: 0,
        vatablePurchase: 0,
        customPurchase: 0,
        vatFreePurchase: 0,
        creditRemainingBalance: 0,
        recordedDate: new Date().toISOString().split('T')[0]
      }));
      setClientAmounts(mappedAmounts);
    }
  }, [isOpen, task.client]);

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
                      onClick={() => removeClientAmount(index)}
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
                      onChange={(date) => handleDateChange(index, date)}
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
                      onChange={(value) => handleAmountChange(index, 'vatableSales', value)}
                      disabled={isLoading}
                    />
                    <AmountField
                      label="VAT Free Sales"
                      value={amount.vatFreeSales}
                      onChange={(value) => handleAmountChange(index, 'vatFreeSales', value)}
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
                      onChange={(value) => handleAmountChange(index, 'vatablePurchase', value)}
                      disabled={isLoading}
                    />
                    <AmountField
                      label="Custom Purchase"
                      value={amount.customPurchase}
                      onChange={(value) => handleAmountChange(index, 'customPurchase', value)}
                      disabled={isLoading}
                    />
                    <AmountField
                      label="VAT Free Purchase"
                      value={amount.vatFreePurchase}
                      onChange={(value) => handleAmountChange(index, 'vatFreePurchase', value)}
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
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Client Total:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      NRs{getTotalAmount(amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Client Button */}
          {task.client && task.client.length > clientAmounts.length && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <Button
                variant="outline"
                onClick={addNewClientAmount}
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Amount for Another Client
              </Button>
            </div>
          )}

          {/* Grand Total */}
          {clientAmounts.length > 1 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">Grand Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  NRs{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}
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