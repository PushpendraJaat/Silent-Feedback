"use client";

import { toast } from "sonner";
import { Message } from "@/models/User";
import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { User } from "next-auth";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, Copy } from "lucide-react";
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

  const form = useForm({ resolver: zodResolver(acceptMessageSchema) });
  const { watch, register, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages ?? false);
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
      const response = await axios.get<ApiResponse>("/api/get-messages");
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
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      }, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      setValue("acceptMessages", !acceptMessages);
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

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl mt-24 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 dark:text-gray-200 mb-6">User Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <input type="text" value={profileUrl} className="w-full p-2 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white" disabled />
          <Button onClick={() => {
            navigator.clipboard.writeText(profileUrl)
            toast.success("Copied to Clipboard");
          }} className="ml-4">
            <Copy className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
          <Switch {...register("acceptMessages")} checked={acceptMessages} onCheckedChange={handleSwitchChange} disabled={isSwitchLoading} />
        </div>
      </div>
      <Separator className="my-6" />
      <Button onClick={() => fetchMessages(true)} disabled={isLoading} className="w-full flex justify-center items-center gap-2">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />} Refresh
      </Button>
      <div className="grid grid-cols-1 gap-4 mt-6">
        {messages.length > 0 ? messages.map((message, index) => (
          <MessageCard key={index} message={message} onMessageDelete={handleDeleteMessage} />
        )) : <p className="text-center text-gray-500">No messages to display</p>}
      </div>
    </div>
  );
};

export default Dashboard;