import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FormField,
  FormControl,
  FormItem,
  FormMessage,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const emailSchema = z.object({
  email: z.string().min(5).email({
    message: "Invalid email address.",
  }),
});

import type { EmailStepProps } from "../../lib/types";

type EmailFormValues = z.infer<typeof emailSchema>;

export default function EmailStep({
  onSubmit,
  isLoading = false,
}: EmailStepProps) {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (values: EmailFormValues) => {
    onSubmit(values.email);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 text-sm">Enter your Email Address</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder=""
                    {...field}
                    className="rounded-md border-gray-300 h-12"
                    disabled={isLoading}
                  />
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
            {isLoading ? "Sending..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
