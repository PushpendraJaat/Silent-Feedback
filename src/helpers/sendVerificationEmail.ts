import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        const res = await resend.emails.send({
            from: 'do-not-reply@silent-feedback.pushpendrajaat.in',
            to: email,
            subject: 'Silent Feedback | Verification Code',
            react: VerificationEmail({username, otp:verifyCode}),
          });
        console.log(res)
        return {success: true, message:"Verification email send successfully"}
    } catch (emailError) {
        console.log("Error sending verification email", emailError);
        return {success: false, message:"Failed to send verification email"}
    }

}