"use client";

import { Message } from '@/models/User';
import { ApiResponse } from '@/types/ApiResponse';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FormData {
  content: string;
}

const Page = () => {
  const params = useParams();
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<Message[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchSuggestedMessages = async () => {
    try {
      setIsLoadingSuggestions(true);
      const response = await axios.post<ApiResponse>('/api/suggest-messages');
      if (response.data?.success && response.data.messages) {
        setSuggestedMessages(response.data.messages);
      }
    } catch (error) {
      console.error(error);
      toast("Error fetching suggested messages", { description: "error" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    // Fetch suggestions once on page load
    fetchSuggestedMessages();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post<ApiResponse>('/api/send-message', {
        username: params.username,
        content: data.content,
      });
      if (response.data?.success) {
        toast("Message sent successfully", { description: "success" });
        setValue("content", "");
      }
    } catch (error) {
      console.error(error);
      toast("Error sending message", { description: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestedClick = (message: Message) => {
    // Fill input with the clicked message
    setValue("content", message.content);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Send a message to {params.username}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <input
          type="text"
          placeholder="Type your message..."
          {...register('content', { required: true })}
          className="border rounded p-2 w-full mb-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Suggested messages</h2>
          <button
            onClick={fetchSuggestedMessages}
            disabled={isLoadingSuggestions}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded disabled:opacity-50"
          >
            {isLoadingSuggestions ? 'Loading...' : 'Generate Messages'}
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {suggestedMessages.map((message, index) => (
            <li
              key={index}
              onClick={() => handleSuggestedClick(message)}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded border"
            >
              {message.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Page;
