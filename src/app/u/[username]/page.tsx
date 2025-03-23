"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@/schemas/messageSchema";
import { Message } from "@/models/User";
import { motion } from "framer-motion";

interface FormData {
  content: string;
}

const Page = () => {
  const { username } = useParams() as { username: string };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [acceptingMessages, setAcceptingMessages] = useState<boolean | null>(null);

  const fetchSuggestedMessages = useCallback(async () => {
    try {
      setIsLoadingSuggestions(true);
      const response = await axios.get<ApiResponse>("/api/suggest-messages");
      if (response.data?.success && Array.isArray(response.data.messages)) {
        setSuggestedMessages(response.data.messages.map((message: Message) => message.content));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching suggested messages");
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestedMessages();
    }
  }, [isOpen, fetchSuggestedMessages]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get<ApiResponse>("/api/accept-messages", {
          params: { username },
        });
        setAcceptingMessages(response.data?.isAcceptingMessages ?? false);
      } catch (error) {
        console.error("Error fetching user status", error);
        setAcceptingMessages(false);
      }
    };
    fetchUserStatus();
  }, [username]);

  const onSubmit = async (data: FormData) => {
    if (acceptingMessages === false) {
      toast.error("User is not accepting messages");
      return;
    }
    if (acceptingMessages === null) {
      toast.info("Checking user status. Please wait...");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content: data.content,
      });
      if (response.data?.success) {
        toast.success("Message sent successfully");
        setValue("content", "");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestedClick = (message: string) => {
    setValue("content", message);
  };

  return (
    <motion.div 
      className="container mx-auto my-32 p-6 max-w-lg bg-gray-100 dark:bg-gray-900 rounded-xl shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        Send an Anonymous Message to {username}
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
        Your identity will remain completely anonymous.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 transition-all hover:shadow-xl"
      >
        <TextareaAutosize
          minRows={3}
          placeholder="Type your message..."
          {...register("content")}
          className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-3 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-all"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mb-2">
            {errors.content.message as string}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-all flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Message"}
        </Button>
      </form>

      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Click to view suggested messages.
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isLoadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronsUpDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <ul className="space-y-2">
            {suggestedMessages.map((message, index) => (
              <li 
                key={index} 
                onClick={() => handleSuggestedClick(message)} 
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-3 rounded border border-gray-300 dark:border-gray-600 transition-colors"
              >
                {message}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default Page;