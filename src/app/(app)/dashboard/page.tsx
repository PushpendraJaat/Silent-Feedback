"use client";

import { toast } from "sonner";
import { Message } from '@/models/User';
import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { User } from "next-auth";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import { useRouter } from "next/navigation";
import useCsrfToken from "@/hooks/useCsrfToken";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const csrfToken = useCsrfToken();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  });
  const { watch, register, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to fetch data");
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages ?? []);
      if (refresh) {
        toast.success("Messages are up to date");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to fetch messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      }, {
        headers: { "X-CSRF-Token": csrfToken }
      });
      setValue('acceptMessages', !acceptMessages);
      toast.success(response.data.message || "Updated successfully");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to update");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session || !session.user) {
    router.push("/signin");
    return <div>Redirecting...</div>;
  }

  const { username } = session.user as User;
  const profileUrl = `${window.location.protocol}//${window.location.host}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied to clipboard");
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl w-full max-w-6xl shadow-lg">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        User Dashboard
      </h1>

      {/* Copy URL Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Copy your unique link:
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300"
            disabled
          />
          <Button
            onClick={copyToClipboard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="mb-6 flex items-center gap-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2 text-gray-800 dark:text-gray-300">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator />

      {/* Refresh Button */}
      <Button
        className="mt-4 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 transition duration-300"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <RefreshCcw className="w-5 h-5" />
            Refresh
          </>
        )}
      </Button>

      {/* Messages Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No messages to display</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
