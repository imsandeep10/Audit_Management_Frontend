import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getCurrentNepalieFiscalYear, generateFiscalYearOptions } from "../../utils/fiscalYear";

export interface ITREstimatedData {
    // ITR fields
    taxableAmount?: number;
    taxAmount?: number;
    taskAmount?: number;

    // Estimated Return fields
    estimatedRevenue?: number;
    netProfit?: number;

    // Common fields
    fiscalYear?: string;
}

export interface TaskWithITRData {
    _id: string;
    taskTitle: string;
    taskType: string;
    description?: string;
    client: any;
    subTasks?: any[];
}

interface ITREstimatedDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ITREstimatedData) => Promise<void>;
    task: TaskWithITRData;
}

const ITREstimatedDialog: React.FC<ITREstimatedDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    task,
}) => {
    const [formData, setFormData] = useState<ITREstimatedData>({
        taxableAmount: 0,
        taxAmount: 0,
        taskAmount: 0,
        estimatedRevenue: 0,
        netProfit: 0,
        fiscalYear: getCurrentNepalieFiscalYear(),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isITR = task?.taskType?.toLowerCase() === "itr";
    const isEstimatedReturn = task?.taskType?.toLowerCase() === "estimated return";

    // Initialize form from existing task data if present
    useEffect(() => {
        if (!task) return;
        const anyTask: any = task as any;
        const initial: ITREstimatedData = {
            taxableAmount: Number(anyTask?.itrData?.taxableAmount ?? anyTask?.taxableAmount ?? 0),
            taxAmount: Number(anyTask?.itrData?.taxAmount ?? anyTask?.taxAmount ?? 0),
            taskAmount: Number(anyTask?.itrData?.taskAmount ?? anyTask?.taskAmount ?? 0),
            estimatedRevenue: Number(anyTask?.estimatedReturnData?.estimatedRevenue ?? anyTask?.estimatedRevenue ?? 0),
            netProfit: Number(anyTask?.estimatedReturnData?.netProfit ?? anyTask?.netProfit ?? 0),
        };
        setFormData(initial);
    }, [task]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate fiscal year for both ITR and Estimated Return
        if (!formData.fiscalYear) {
            newErrors.fiscalYear = "Fiscal Year is required";
        }

        if (isITR) {
            if (formData.taxableAmount === undefined || formData.taxableAmount === null) {
                newErrors.taxableAmount = "Taxable Amount is required";
            }
            if (!formData.taxAmount || formData.taxAmount <= 0) {
                newErrors.taxAmount = "Tax Amount is required and must be greater than 0";
            }
            if (!formData.taskAmount || formData.taskAmount <= 0) {
                newErrors.taskAmount = "Task Amount is required and must be greater than 0";
            }
        }

        if (isEstimatedReturn) {
            if (!formData.estimatedRevenue || formData.estimatedRevenue <= 0) {
                newErrors.estimatedRevenue = "Estimated Revenue is required and must be greater than 0";
            }
            if (!formData.netProfit || formData.netProfit <= 0) {
                newErrors.netProfit = "Net Profit is required and must be greater than 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof ITREstimatedData, value: string) => {
        // Handle fiscal year as string, others as numbers
        if (field === 'fiscalYear') {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        } else {
            // Allow empty string, negative numbers, and decimal values
            const numValue = value === "" ? 0 : parseFloat(value);
            setFormData(prev => ({
                ...prev,
                [field]: isNaN(numValue) ? 0 : numValue
            }));
        }

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving ITR/Estimated data:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            taxableAmount: 0,
            taxAmount: 0,
            taskAmount: 0,
            estimatedRevenue: 0,
            netProfit: 0,
            fiscalYear: getCurrentNepalieFiscalYear(),
        });
        setErrors({});
        onClose();
    };

    const getClientName = () => {
        if (Array.isArray(task?.client)) {
            return task.client.map((c: any) =>
                typeof c === 'string' ? c : c.companyName || c.name
            ).join(', ');
        }
        return typeof task?.client === 'string'
            ? task.client
            : task?.client?.companyName || task?.client?.name || 'Unknown Client';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Complete {task?.taskType} Task
                    </DialogTitle>
                    <DialogDescription>
                        Please fill in the required information for <strong>{task?.taskTitle}</strong>
                        <br />
                        <span className="text-sm text-gray-600">Client: {getClientName()}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Fiscal Year Selection - Common for both ITR and Estimated Return */}
                    <div className="space-y-2">
                        <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                        <Select
                            value={formData.fiscalYear}
                            onValueChange={(value) => handleInputChange('fiscalYear', value)}
                        >
                            <SelectTrigger className={errors.fiscalYear ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select Fiscal Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {generateFiscalYearOptions(10, 2).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fiscalYear && (
                            <p className="text-red-500 text-sm mt-1">{errors.fiscalYear}</p>
                        )}
                    </div>

                    {isITR && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="taskAmount">Total Turnover *</Label>
                                <Input
                                    id="taskAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.taskAmount || ''}
                                    onChange={(e) => handleInputChange('taskAmount', e.target.value)}
                                    placeholder="Enter task amount"
                                    className={errors.taskAmount ? 'border-red-500' : ''}
                                />
                                {errors.taskAmount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.taskAmount}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="taxableAmount">Taxable Amount *</Label>
                                <Input
                                    id="taxableAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.taxableAmount || ''}
                                    onChange={(e) => handleInputChange('taxableAmount', e.target.value)}
                                    placeholder="Enter taxable amount (can be negative)"
                                    className={errors.taxableAmount ? 'border-red-500' : ''}
                                />
                                {errors.taxableAmount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.taxableAmount}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxAmount">Tax Amount *</Label>
                                <Input
                                    id="taxAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.taxAmount || ''}
                                    onChange={(e) => handleInputChange('taxAmount', e.target.value)}
                                    placeholder="Enter tax amount"
                                    className={errors.taxAmount ? 'border-red-500' : ''}
                                />
                                {errors.taxAmount && (
                                    <p className="text-red-500 text-sm mt-1">{errors.taxAmount}</p>
                                )}
                            </div>
                        </>
                    )}

                    {isEstimatedReturn && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="estimatedRevenue">Estimated Revenue *</Label>
                                <Input
                                    id="estimatedRevenue"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.estimatedRevenue || ''}
                                    onChange={(e) => handleInputChange('estimatedRevenue', e.target.value)}
                                    placeholder="Enter estimated revenue"
                                    className={errors.estimatedRevenue ? 'border-red-500' : ''}
                                />
                                {errors.estimatedRevenue && (
                                    <p className="text-red-500 text-sm mt-1">{errors.estimatedRevenue}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="netProfit">Net Profit *</Label>
                                <Input
                                    id="netProfit"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.netProfit || ''}
                                    onChange={(e) => handleInputChange('netProfit', e.target.value)}
                                    placeholder="Enter net profit"
                                    className={errors.netProfit ? 'border-red-500' : ''}
                                />
                                {errors.netProfit && (
                                    <p className="text-red-500 text-sm mt-1">{errors.netProfit}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="bg-gray-200 hover:bg-gray-300 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        >
                            {isSubmitting ? "Saving..." : "Complete Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ITREstimatedDialog;