"use client";

import { verifySchema } from "@/schemas/verifySchema";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const VerifyQuerySchema = z.object({
  code: verifySchema,
});

const COOLDOWN_TIME = 60; // Cooldown period in seconds

const VerifyAccount = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const params = useParams();

  // Form Setup (using Zod)
  const form = useForm<z.infer<typeof VerifyQuerySchema>>({
    resolver: zodResolver(VerifyQuerySchema),
  });

  // Countdown Timer for Cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Form Submission (Verification)
  const onSubmit = async (data: z.infer<typeof VerifyQuerySchema>) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/verify-code", {
        username: params.username,
        code: data.code,
      });

      toast.success(response.data.message);
      router.push("/signin");
    } catch (error) {
      console.error("Error verifying user code", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast.error("Verification failed", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend Code Request
  const handleResendCode = async () => {
    if (cooldown > 0) return;

    try {
      setCooldown(COOLDOWN_TIME);
      const response = await axios.post("/api/resend-code", {
        username: params.username,
      });

      toast.success("Code resent successfully", {
        description: response.data.message,
      });
    } catch (error) {
      console.error("Failed to resend code", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast.error("Failed to resend code", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl transform transition-all hover:scale-[1.02]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Account</h1>
          <p className="text-gray-500 mt-2">
            Enter the verification code to activate your account.
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Verification Code Input */}
            <FormField
              control={form.control}
              name="code"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your code"
                      {...field}
                      className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-all rounded-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>

        {/* Resend Code Button */}
        <div className="text-center mt-6 text-gray-600">
          {cooldown > 0 ? (
            <p className="text-gray-400">
              Resend code available in{" "}
              <span className="font-semibold text-blue-500">{cooldown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={cooldown > 0}
              className="text-blue-500 hover:text-blue-700 transition font-semibold"
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
