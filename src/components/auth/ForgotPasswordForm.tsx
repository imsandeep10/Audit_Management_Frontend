import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import PasswordStep from "./PasswordStep";
import axiosInstance from "../../api/axiosInstance";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [userEmail, setUserEmail] = useState<string>("");
  const [otpResent, setOtpResent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/reset", {
        email,
      });

      if (response.status === 200) {
        setUserEmail(email);
        setStep("otp");
        toast.success("OTP sent to your email");
      } else {
        toast.error("Failed to send reset email");
      }
    } catch (error) {
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (userOtp: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        "/auth/otp-validation",
        { userOtp, email: userEmail },
      );

      if (response.status === 200) {
        setStep("password");
        toast.success("OTP verified successfully");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.patch(
        "/auth/update-password",
        {
          newPassword,
          email: userEmail,
        },
      );
      if (response.status === 200) {
        toast.success("Password changed successfully");
        navigate("/signin");
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/reset", {
        email: userEmail,
      });

      if (response.status === 200) {
        setOtpResent(true);
        toast.success("OTP resent to your email");
        setTimeout(() => setOtpResent(false), 3000);
      } else {
        toast.error("Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 p-8 w-full">
      {step === "email" && (
        <EmailStep onSubmit={handleEmailSubmit} isLoading={isLoading} />
      )}
      {step === "otp" && (
        <OtpStep
          email={userEmail}
          onSubmit={handleOtpSubmit}
          onResendOtp={handleResendOtp}
          otpResent={otpResent}
          isLoading={isLoading}
        />
      )}
      {step === "password" && (
        <PasswordStep onSubmit={handlePasswordSubmit} isLoading={isLoading} />
      )}
    </div>
  );
}
