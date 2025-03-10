import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!session || !user) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
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
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
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
        return Response.json({ success: false, message: "failed to update user status to accept messages" }, { status: 500 });
    }
}

export async function GET(request: Request) {

    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user;
  
    if (!session || !user) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  
    const url = new URL(request.url);
    // If username is provided in URL, use it; otherwise, fallback to session user
    const usernameFromUrl = url.searchParams.get("username");
    const usernameToSearch = usernameFromUrl || user.username;
    
    try {
        const foundUser = await UserModel.findOne({username: usernameToSearch})
        if(!foundUser) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage
        })
    } catch (error) {
        console.log("failed to get user status to accept messages", error);
        return Response.json({ success: false, message: "failed to get user status to accept messages" }, { status: 500 });
    }
}