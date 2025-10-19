import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { itrSchema, estimatedReturnSchema } from "../../schemas/itrEstimatedSchema";
import { useUpdateITREstimatedData } from "../../api/useTask";

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
    task: TaskWithITRData;
    onSuccess?: () => void; // Optional callback after successful save
}

const ITREstimatedDialog: React.FC<ITREstimatedDialogProps> = ({
    isOpen,
    onClose,
    task,
    onSuccess,
}) => {
    const isITR = task?.taskType?.toLowerCase() === "itr";
    const isEstimatedReturn = task?.taskType?.toLowerCase() === "estimated return";

    // Use the appropriate schema based on task type
    const schema = isITR ? itrSchema : estimatedReturnSchema;
    
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            fiscalYear: getCurrentNepalieFiscalYear(),
            ...(isITR ? {
                taxableAmount: 0,
                taxAmount: 0,
                taskAmount: 0,
            } : {
                estimatedRevenue: 0,
                netProfit: 0,
            }),
        },
    });

    const {
        register,
        handleSubmit: hookFormHandleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset,
    } = form;

    const updateMutation = useUpdateITREstimatedData();

    // Initialize form from existing task data if present
    useEffect(() => {
        if (!task) return;
        const anyTask: any = task as any;
        
        if (isITR) {
            reset({
                fiscalYear: getCurrentNepalieFiscalYear(),
                taxableAmount: Number(anyTask?.itrData?.taxableAmount ?? anyTask?.taxableAmount ?? 0),
                taxAmount: Number(anyTask?.itrData?.taxAmount ?? anyTask?.taxAmount ?? 0),
                taskAmount: Number(anyTask?.itrData?.taskAmount ?? anyTask?.taskAmount ?? 0),
            });
        } else if (isEstimatedReturn) {
            reset({
                fiscalYear: getCurrentNepalieFiscalYear(),
                estimatedRevenue: Number(anyTask?.estimatedReturnData?.estimatedRevenue ?? anyTask?.estimatedRevenue ?? 0),
                netProfit: Number(anyTask?.estimatedReturnData?.netProfit ?? anyTask?.netProfit ?? 0),
            });
        }
    }, [task, isITR, isEstimatedReturn, reset]);

    const onSubmit = async (data: any) => {
        try {
            await updateMutation.mutateAsync({
                taskId: task._id,
                data: data,
            });
            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
            handleClose();
        } catch (error) {
            console.error("Error saving ITR/Estimated data:", error);
        }
    };

    const handleClose = () => {
        reset();
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
                        <br />
                        <span className="text-xs text-blue-600 mt-1">
                            ℹ️ This data will be saved and the task will be marked as completed.
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={hookFormHandleSubmit(onSubmit)} className="space-y-4">
                    {/* Fiscal Year Selection - Common for both ITR and Estimated Return */}
                    <div className="space-y-2">
                        <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                        <Select
                            value={watch("fiscalYear")}
                            onValueChange={(value) => setValue("fiscalYear", value)}
                        >
                            <SelectTrigger className={errors.fiscalYear ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select Fiscal Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {generateFiscalYearOptions(5, 5).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fiscalYear && (
                            <p className="text-red-500 text-sm mt-1">{errors.fiscalYear.message}</p>
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
                                    {...register("taskAmount" as any)}
                                    placeholder="Enter Total Turnover"
                                    className={(errors as any).taskAmount ? 'border-red-500' : ''}
                                />
                                {(errors as any).taskAmount && (
                                    <p className="text-red-500 text-sm mt-1">{(errors as any).taskAmount.message}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="taxableAmount">Taxable Amount *</Label>
                                <Input
                                    id="taxableAmount"
                                    type="number"
                                    step="0.01"
                                    {...register("taxableAmount" as any)}
                                    placeholder="Enter taxable amount (can be negative)"
                                    className={(errors as any).taxableAmount ? 'border-red-500' : ''}
                                />
                                {(errors as any).taxableAmount && (
                                    <p className="text-red-500 text-sm mt-1">{(errors as any).taxableAmount.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxAmount">Tax Amount *</Label>
                                <Input
                                    id="taxAmount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register("taxAmount" as any)}
                                    placeholder="Enter tax amount"
                                    className={(errors as any).taxAmount ? 'border-red-500' : ''}
                                />
                                {(errors as any).taxAmount && (
                                    <p className="text-red-500 text-sm mt-1">{(errors as any).taxAmount.message}</p>
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
                                    {...register("estimatedRevenue" as any)}
                                    placeholder="Enter estimated revenue"
                                    className={(errors as any).estimatedRevenue ? 'border-red-500' : ''}
                                />
                                {(errors as any).estimatedRevenue && (
                                    <p className="text-red-500 text-sm mt-1">{(errors as any).estimatedRevenue.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="netProfit">Net Profit *</Label>
                                <Input
                                    id="netProfit"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register("netProfit" as any)}
                                    placeholder="Enter net profit"
                                    className={(errors as any).netProfit ? 'border-red-500' : ''}
                                />
                                {(errors as any).netProfit && (
                                    <p className="text-red-500 text-sm mt-1">{(errors as any).netProfit.message}</p>
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