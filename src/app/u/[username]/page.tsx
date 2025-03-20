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
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageSchema } from "@/schemas/messageSchema";
import { Message } from "@/models/User";

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

  const fetchSuggestedMessages = async () => {
    try {
      setIsLoadingSuggestions(true);
      const response = await axios.post<ApiResponse>("/api/suggest-messages");
      if (response.data?.success && Array.isArray(response.data.messages)) {
        setSuggestedMessages(response.data.messages.map((message: Message) => message.content));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching suggested messages");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get<ApiResponse>("/api/accept-messages", {
          params: { username },
        });
        if (response.data?.success) {
          setAcceptingMessages(response.data.isAcceptingMessages || false);
        } else {
          setAcceptingMessages(false);
        }
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
    <div className="container mx-auto p-6 max-w-lg">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        Send a Message to {username}
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-5"
      >
        <TextareaAutosize
          minRows={3}
          placeholder="Type your message..."
          {...register("content")}
          className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-md p-3 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-all"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mb-2">
            {errors.content.message as string}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-md transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </form>

      {/* Collapsible for Suggestions */}
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <div className="flex items-center justify-between space-x-4 p-3 border border-gray-300 dark:border-gray-700 rounded-md">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Click to view suggested messages.
          </h4>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSuggestedMessages}
              className="dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isLoadingSuggestions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ul className="space-y-2 mt-2">
            {suggestedMessages.map((message, index) => (
              <li
                key={index}
                onClick={() => handleSuggestedClick(message)}
                className="cursor-pointer bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                {message}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default Page;
