"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const Page = () => {

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  //zod
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>('/api/auth/', data)
      toast("Success", {
        description: response.data.message
      })
      router.replace(`/dashboard/`)
    } catch (error) {
      console.error("Error in signin of user", error)
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast("Sign In failed", {
        description: errorMessage
      })
    }
    finally {
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
          <p className="mb-4">Sign in to start your anonymous adventure.</p>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username or Email</FormLabel>
                    <FormControl>
                      <Input placeholder="username"
                        {...field} />

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
                      <Input type="password" placeholder="password"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {
                  isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /></>) : ("Signin")
                }
              </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p>
              Did not have a account?{' '}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Page
