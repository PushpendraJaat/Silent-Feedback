import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!session || !user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessage: acceptMessages
            },
            {
                new: true
            }
        )
        if (!updatedUser) {
            return new Response("Failed to update user status to accept messages", { status: 401 });
        }
        return Response.json(
            {
                success: true,
                message: "User status updated successfully",
                updatedUser
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("failed to update user status to accept messages", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function GET() {

    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!session || !user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser) {
            return new Response("User not found", { status: 404 });
        }
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
        })
    } catch (error) {
        console.log("failed to get user status to accept messages", error);
        return new Response("failed to get user status to accept messages", { status: 500 });
    }
}