"use client"

import { toast } from "sonner"
import { Message } from '@/models/User'
import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { User } from "next-auth"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw } from "lucide-react"
import MessageCard from "@/components/MessageCard"
import { useRouter } from "next/router"

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false)
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId))
  }
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })
  const { watch, register, setValue } = form
  const accectMessages = watch('acceptMessages')
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast('Failed to fetch accept messages', {
        description: axiosError.response?.data.message,
      })
    }
    finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refress: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages ?? [])
      if (refress) {
        toast('Showing latest messages', {
          description: 'Messages are up to date'
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast('Failed to fetch messages', {
        description: axiosError.response?.data.message,
      })
    }
    finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessages()
  }, [session, setValue, fetchAcceptMessages, fetchMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !accectMessages
      })
      setValue('acceptMessages', !accectMessages)
      toast(response.data.message, {
        description: 'User status updated successfully'
      })

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast('Failed to update status of user to accept messages', {
        description: axiosError.response?.data.message,
      })
    }
  }

   // Show a loading state if the session is being fetched
   if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If the user is not authenticated, redirect or show an error
  if (!session || !session.user) {
    router.push("/signin");
    return <div>Redirecting...</div>;
  }

  const { username } = session?.user as User
  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast('Profile URL copied to clipboard', {
      description: profileUrl
    })
  }

  if (!session || !session.user) return <div>Please Login</div>
  console.log(messages)

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy your unique link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            className="input input-border w-full p-2 mr-2 rounded"
            disabled
          />
          <button
            onClick={copyToClipboard}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={accectMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {accectMessages ? 'On' : 'Off'}</span>
      </div>

      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <RefreshCcw className="w-8 h-8" />
        )}

      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No message to desplay</p>

        )}
      </div>
    </div>
  )
}

export default Dashboard
