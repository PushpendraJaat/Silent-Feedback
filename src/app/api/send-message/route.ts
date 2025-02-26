import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();
    const {username, content} = await request.json();
    try {

        const user = await UserModel.findOne({username});

        if(!user) {
            return new Response("User not found", { status: 404 });
        }

        if(!user.isAcceptingMessage) {
            return new Response("User is not accepting messages", { status: 400 });
        }

        const newMessage = {content, createdAt: new Date()};
        user.messages.push(newMessage as Message);
        await user.save();

        return new Response("Message sent successfully", { status: 200 }); 

    } catch (error) {
        console.log("failed to send message", error);
        return new Response("Internal Server Error, failed to send message", { status: 500 });
    }
}
