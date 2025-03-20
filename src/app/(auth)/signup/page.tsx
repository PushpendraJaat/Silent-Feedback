"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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

const Page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const csrfToken = useCsrfToken(); // ✅ CSRF token hook
  const debounced = useDebounceCallback(setUsername, 300);
  const router = useRouter();

  // ✅ Zod schema validation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // ✅ Check username availability
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`,
            {
              headers: {
                "X-CSRF-Token": csrfToken, // ✅ Include CSRF token
              },
            }
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          if (axiosError.response?.status === 409) {
            setUsernameMessage("Username already exists");
          } else {
            setUsernameMessage("Error checking username.");
          }
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();
  }, [username, csrfToken]);

  // ✅ Form submission
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data, {
        headers: {
          "X-CSRF-Token": csrfToken, // ✅ Include CSRF token
        },
      });

      toast.success(response.data.message);
      router.replace(`/verify/${data.username}`);
    } catch (error) {
      console.error("Error in signup:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message || "Signup failed.";
      toast.error("Signup failed", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
        {/* ✅ Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Sign up to join the community.
          </p>
        </div>

        {/* ✅ Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ✅ Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value); // ✅ Debounced input
                        }}
                      />
                      {isCheckingUsername && (
                        <Loader2 className="absolute right-3 top-2 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </FormControl>
                  <p
                    className={`text-sm ${
                      usernameMessage === "Username is available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {usernameMessage}
                  </p>
                  <FormDescription>This will be your public username.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Submit Button */}
            <Button
              type="submit"
              disabled={
                isSubmitting || usernameMessage === "Username already exists"
              }
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

        {/* ✅ Sign In Link */}
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