"use client";

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { ApiResponse } from '@/types/ApiResponse';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import TextareaAutosize from 'react-textarea-autosize';
import { zodResolver } from '@hookform/resolvers/zod';
import { messageSchema } from '@/schemas/messageSchema';
import { motion } from 'framer-motion';

interface FormData {
  content: string;
}

const Page = () => {
  const { username } = useParams() as { username: string };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [acceptingMessages, setAcceptingMessages] = useState<boolean | null>(null);

  const fetchSuggestedMessages = async () => {
    try {
      setIsLoadingSuggestions(true);
      const response = await axios.post<ApiResponse>('/api/suggest-messages');
      if (response.data?.success && Array.isArray(response.data.messages)) {
        // Cast messages to unknown first then to string[]
        setSuggestedMessages((response.data.messages as unknown) as string[]);
      }
    } catch (error) {
      console.error(error);
      toast("Error fetching suggested messages", { description: "error" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get<ApiResponse>('/api/accept-messages', {
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
  });

  const onSubmit = async (data: FormData) => {
    // Check if the user is accepting messages
    if (acceptingMessages === false) {
      toast("User is not accepting messages", { description: "Please try later" });
      return;
    }
    if (acceptingMessages === null) {
      toast("Checking user status. Please wait...", { description: "info" });
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.post<ApiResponse>('/api/send-message', {
        username,
        content: data.content,
      });
      if (response.data?.success) {
        toast("Message sent successfully", { description: "Success" });
        setValue("content", "");
      }
    } catch (error) {
      console.error(error);
      toast("Error sending message", { description: "User is not accepting messages" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestedClick = (message: string) => {
    setValue("content", message);
  };

  return (
    <motion.div 
      className="mt-12 container mx-auto p-6 max-w-lg rounded-xl shadow-lg bg-gradient-to-r from-neutral-300 to-stone-400 dark:bg-gray-900 transition-colors duration-500"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        Send a Message to {username}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <TextareaAutosize
          minRows={3}
          placeholder="Type your message..."
          {...register('content')}
          className="border border-gray-300 dark:border-gray-700 rounded p-3 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 resize-none transition-colors"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mb-2">{errors.content.message as string}</p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </form>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Click to view suggested messages.
          </h4>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchSuggestedMessages();
                setIsOpen(true);
              }}
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
        <CollapsibleContent className="space-y-2">
          <ul className="space-y-2">
            {suggestedMessages.map((message, index) => (
              <motion.li
                key={index}
                onClick={() => handleSuggestedClick(message)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {message}
              </motion.li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default Page;
