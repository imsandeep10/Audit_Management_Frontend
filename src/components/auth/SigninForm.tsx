import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FormField,
  FormControl,
  FormItem,
  FormMessage,
  FormLabel,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SigninForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "camohankhatri1952@gmail.com",
      password: "Admin@123",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await login(values.email, values.password);
      navigate("/dashboard");
      sessionStorage.setItem("justLoggedIn", "true");
    } catch (error: any) {
      toast.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Function to clear email field
  const clearEmail = () => {
    form.setValue("email", "", { shouldValidate: true });
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-white p-8 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder=""
                        {...field}
                        className="rounded-md border-gray-300 pr-10"
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={clearEmail}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="enter password"
                        {...field}
                        className="rounded-md border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => togglePassword()}
                        aria-label={
                          showPassword ? "Hide password" : "show password"
                        }
                        className="absolute top-0 right-0 h-full px-3"
                      >
                        {showPassword ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm font-medium ">
                Forgotten Password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-md disabled:opacity-50"
            >
              {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
