"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import useCsrfToken from "@/hooks/useCsrfToken";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { CustomPasswordField } from "@/components/ui/CustomPasswordField";

const Page = () => {
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSRF token for all requests
  const csrfToken = useCsrfToken();
  const router = useRouter();

  // React Hook Form with Zod validation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const { watch, getFieldState, handleSubmit, control } = form;
  const username = watch("username");

  // Debounced username for server checks (500ms delay)
  const debouncedUsername = useDebounce(username, 500);

  /**
   * Check username availability only if:
   *  1) Username passes Zod validation
   *  2) Debounced username is not empty
   */
  useEffect(() => {
    const usernameState = getFieldState("username");

    if (!debouncedUsername || usernameState.invalid) {
      setUsernameMessage("");
      return;
    }

    const checkUsernameUnique = async () => {
      setIsCheckingUsername(true);
      setUsernameMessage("");
      try {
        const res = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`, {
          headers: { "X-CSRF-Token": csrfToken },
        });
        setUsernameMessage(res.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message || "Error checking username.");
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername, csrfToken, getFieldState]);

  /**
   * On Form Submit
   * If form passes Zod validation, call the /api/signup
   */
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      toast.success(response.data.message);
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Signup failed", { description: axiosError.response?.data.message || "Signup failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign up to join the community.</p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <FormField
              control={control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter username" {...field} className="dark:bg-gray-700 dark:text-gray-100" />
                      {isCheckingUsername && (
                        <Loader2 className="absolute right-3 top-2 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </FormControl>

                  {/* Zod validation error */}
                  <FormMessage className="text-red-500 dark:text-red-400" />

                  {/* Server check result (only if Zod is valid) */}
                  {!getFieldState("username").invalid && usernameMessage && (
                    <p
                      className={`text-sm ${usernameMessage === "Username is available" ? "text-green-500" : "text-red-500 dark:text-red-400"
                        }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormDescription>This will be your public username.</FormDescription>
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} className="dark:bg-gray-700 dark:text-gray-100" />
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
            <Button
              type="submit"
              disabled={isSubmitting || usernameMessage === "Username already exists"}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-500 hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
