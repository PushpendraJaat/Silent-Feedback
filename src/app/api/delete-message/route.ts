import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId");

  if (!messageId) {
    return NextResponse.json(
      { success: false, message: "Message ID is required" },
      { status: 400 }
    );
  }

  console.log("messageId", messageId);

  try {
    const result = await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(user._id) },
      { $pull: { messages: { _id: messageId } } }
    );
    console.log("update result", result);

    if (!result || result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete message", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 501 }
    );
  }
}
