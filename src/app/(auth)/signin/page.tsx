"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema";
import { Button } from "@/components/ui/button";
import { CustomPasswordField } from "@/components/ui/CustomPasswordField";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn, SignInResponse } from "next-auth/react";
import useCsrfToken from "@/hooks/useCsrfToken";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csrfToken = useCsrfToken(); // ✅ Use the hook
  const router = useRouter();

  // ✅ Zod schema validation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result: SignInResponse | undefined = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      if (result?.error) {
        toast.error("Login failed", { description: "Invalid credentials!" });
      } else if (result?.url) {
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Error in signing in:", error);
      toast.error("Sign In failed!", { description: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome Back!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to continue your journey.</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identifier Field */}
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email or username" {...field} className="dark:bg-gray-700 dark:text-gray-100" />
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            {/* Use the custom password field */}
            <CustomPasswordField
              name="password"
              label="Password"
              control={form.control}
              placeholder="Enter your password"
            />


            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:text-blue-700">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
