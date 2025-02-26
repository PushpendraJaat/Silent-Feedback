import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user;

    if (!session || !user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            {
                $match: { _id: userId }
            },
            {
                $unwind: "$messages"
            },
            {
                $sort: { "messages.createdAt": -1 }
            },
            {
                $group: {
                    _id: "$_id",
                    messages: { $push: "$messages" }
                }
            },
            {
                $project: {
                    _id: 0,
                    messages: 1
                }
            }
        ])
        
        if(!user || user.length === 0) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify(user[0].messages), { status: 200 });

    } catch (error) {
        console.log("failed to get user messages", error);
        return new Response("Internal Server Error, failed to get user messages", { status: 500 });
    }

}