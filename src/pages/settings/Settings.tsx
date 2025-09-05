import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { employeeService } from "../../api/employeeService";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const employeePasswordSchema = z.object({
  email: z
    .string("Email is required")
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  newPassword: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

const sendMailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export type EmployeePasswordForm = z.infer<typeof employeePasswordSchema>;
export type SendMailForm = z.infer<typeof sendMailSchema>;

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  // Password form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeePasswordForm>({
    resolver: zodResolver(employeePasswordSchema),
    mode: "onBlur",
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: EmployeePasswordForm) => {
      return await employeeService.updateEmployeePassword(data);
    },
    onSuccess(data: any) {
      toast.success(data?.message || "Employee password changed successfully");
      reset();
    },
    onError(error: any) {
      toast.error(error?.message || "Failed to update employee password");
    },
  });

  const onPasswordSubmit: SubmitHandler<EmployeePasswordForm> = (data) => {
    passwordMutation.mutate(data);
  };

  // Mail form
  const {
    register: mailRegister,
    handleSubmit: handleMailSubmit,
    formState: { errors: mailErrors },
    reset: resetMail,
  } = useForm<SendMailForm>({
    resolver: zodResolver(sendMailSchema),
    mode: "onBlur",
  });

  const mailMutation = useMutation({
    mutationFn: async (data: SendMailForm) => {
      return await employeeService.sendMail(data); 
    },
    onSuccess(data: any) {
      toast.success(data?.message || "Mail sent successfully");
      resetMail();
    },
    onError(error: any) {
      toast.error(error?.message || "Failed to send mail");
    },
  });

  const onMailSubmit: SubmitHandler<SendMailForm> = (data) => {
    mailMutation.mutate(data);
  };

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage account security and communication settings
        </p>
      </div>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound size={16} />
            Change Password
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center gap-2">
            <Mail size={16} />
            Send Mail
          </TabsTrigger>
        </TabsList>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Employee Password</CardTitle>
              <CardDescription>
                Update password for an employee account. Passwords must be at least 8 characters long.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@company.com"
                      {...register("email")}
                      className={
                        errors.email ? "border-destructive focus:border-destructive" : ""
                      }
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...register("newPassword")}
                        className={
                          errors.newPassword
                            ? "border-destructive focus:border-destructive pr-10"
                            : "pr-10"
                        }
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-destructive">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={passwordMutation.isPending}
                >
                  {passwordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mail Tab */}
        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>Send Mail</CardTitle>
              <CardDescription>
                Send an email message to employees or teams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMailSubmit(onMailSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject"
                      {...mailRegister("subject")}
                      className={
                        mailErrors.subject ? "border-destructive focus:border-destructive" : ""
                      }
                    />
                    {mailErrors.subject && (
                      <p className="text-sm text-destructive">
                        {mailErrors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Type your message here..."
                      {...mailRegister("message")}
                      className={
                        mailErrors.message ? "border-destructive focus:border-destructive" : ""
                      }
                    />
                    {mailErrors.message && (
                      <p className="text-sm text-destructive">
                        {mailErrors.message.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={mailMutation.isPending}
                >
                  {mailMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;