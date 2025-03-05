"use client"

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Message } from "@/models/User"
import { toast } from "sonner"
import axios from "axios"
import { ApiResponse } from "@/types/ApiResponse"

type MessageCardProps = {
    message: Message,
    onMessageDelete: (messageId: string) => void
}

const MessageCard = ({ message, onMessageDelete }
    : MessageCardProps
) => {
    const handleDeleteConfirm = async () => {
    const response = await axios.delete<ApiResponse>(`/api/delete-message/`, {
        params: {
            messageId: message._id
        }
    })
    toast(response.data.message)
    onMessageDelete(message._id as string)
    }
    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
            <div>
                <CardTitle>{message.content}</CardTitle>
                <CardDescription>{new Date(message.createdAt).toLocaleString()}</CardDescription>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild></AlertDialogTrigger>
                <Button variant="destructive" size="icon" className="ml-2">
                    <X className="w-5 h-5" />
                </Button>
                
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this message.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </CardHeader>
        </Card>

    )
}

export default MessageCard
