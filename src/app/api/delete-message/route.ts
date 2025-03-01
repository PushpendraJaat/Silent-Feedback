import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!session || !user) {
        return Response.json({success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    const { message } = await request.json();

    try {
        const user = await UserModel.updateOne(
            { _id: userId },
            { $pull: { messages: { _id: message._id } } }
        );

        if (!user || user.modifiedCount === 0) {
            return Response.json({success: false, message: "Message not found" }, { status: 404 });
        }

        return Response.json({success: true, message: "Message deleted successfully" }, { status: 200 });

    } catch (error) {
        console.log("failed to delete message", error);
        return Response.json({success: false, message: "failed to delete message" }, { status: 501 });
    }
}