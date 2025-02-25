import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { usernameValidaton } from "@/schemas/signUpSchema";

const VerifyQuerySchema = z.object({
    code: verifySchema,
    username: usernameValidaton
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const parsedData = VerifyQuerySchema.safeParse(body);

        if (!parsedData.success) {
            const errorMessages = parsedData.error.flatten().fieldErrors;
            return new Response(
                JSON.stringify({
                    success: false,
                    message: errorMessages.code?.join(", ") || "Invalid input",
                }),
                { status: 400 }
            );
        }

        const { username, code } = parsedData.data;

        const user = await UserModel.findOne({ username });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const isCodeValid = user.verificationCode === code;
        const isCodeNotExpired = new Date(user.verificationCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                { success: true, message: "User account verified successfully" },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired, please signup again to get a new code",
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                { success: false, message: "Invalid verification code" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying code", error);
        return Response.json(
            { success: false, message: "Error verifying code" },
            { status: 500 }
        );
    }
}