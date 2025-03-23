"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Message } from "@/models/User";
import { toast } from "sonner";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>("/api/delete-message/", {
        params: { messageId: message._id },
      });
      toast.success(response.data.message);
      onMessageDelete(message._id as string);
    } catch (error) {
      console.error("Failed to delete message", error);
      toast.error("Failed to delete message");
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl transition-transform duration-300 hover:scale-[1.02]">
      <CardHeader className="flex justify-between items-center p-6">
        {/* Message Content */}
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white leading-snug">
            {message.content}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(message.createdAt).toLocaleString()}
          </CardDescription>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-400 dark:hover:bg-red-900 transition duration-300"
            >
              <X className="w-5 h-5 text-red-800 dark:text-red-300" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this message? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white transition duration-300"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
