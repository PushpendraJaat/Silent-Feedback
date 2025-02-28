"use client"

import { verifySchema } from '@/schemas/verifySchema'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from "sonner"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const VerifyQuerySchema = z.object({
    code: verifySchema,
});

const VerifyAccount = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const params = useParams()

  //zod
  const form = useForm<z.infer<typeof VerifyQuerySchema>>({
    resolver: zodResolver(VerifyQuerySchema),
  })

  const onSubmit = async (data: z.infer<typeof VerifyQuerySchema>) => {
    try {
      setIsSubmitting(true)
      const response = await axios.post('/api/verify-code', {
        username: params.username,
        code: data.code
      })

      toast("Success", {
        description: response.data.message
      })

      router.replace('signin')

    } catch (error) {
      console.error("Error in verify user code", error)
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast("Verification failed", {
        description: errorMessage
      })
    }
    finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-t-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Secret Message
          </h1>
          <p className="mb-4">Verify your account.</p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                defaultValue = ""
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>Submit</Button>
            </form>
          </Form>
        </div>
      </div>

    </div>
  )
}

export default VerifyAccount
