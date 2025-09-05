import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  FormField,
  FormControl,
  FormItem,
  FormMessage,
  Form,
} from "../ui/form";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const otpSchema = z.object({
  otp: z.string().length(6, {
    message: "OTP must be 6 digits.",
  }),
});

import type { OtpStepProps } from "../../lib/types";

type OtpFormValues = z.infer<typeof otpSchema>;

export default function OtpStep({
  email,
  onSubmit,
  onResendOtp,
  otpResent = false,
  isLoading = false,
}: OtpStepProps) {
  const [countdown, setCountdown] = useState(0);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = (values: OtpFormValues) => {
    onSubmit(values.otp);
  };

  const handleResendOtp = () => {
    onResendOtp();
    setCountdown(120); // 2 minutes = 120 seconds
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <p className="text-gray-800 text-sm mb-4">
          An OTP is sent to your email
          <span className="font-bold">({email})</span> to set your password and
          is valid for 10 minutes.
        </p>
        {otpResent && (
          <p className="text-red-500 text-sm font-medium mb-4">
            OTP Resent. Please enter the OTP here
          </p>
        )}
        <p className="text-gray-800 text-sm font-medium">
          Please enter the OTP here
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full shadow-none"
                      disabled={isLoading}
                    >
                      <InputOTPGroup className="">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-200 hover:bg-blue-300 text-gray-800 font-medium py-3 rounded-md h-12"
          >
            {isLoading ? "Verifying..." : "Next"}
          </Button>

          <div className="text-center">
            <span className="text-gray-600 text-sm">Not Received an OTP? </span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading || countdown > 0}
              className="text-blue-500 text-sm font-medium hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Resend OTP (${formatTime(countdown)})`
                : "Resend OTP"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
