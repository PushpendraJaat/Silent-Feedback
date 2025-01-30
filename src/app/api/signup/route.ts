import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";



export async function POST(request: Request) {
    console.log("connectingdb");
    
    await dbConnect()

    try {
        const { username, email, password } = await request.json()
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + 1) // 1 hour expiry
        const code = Math.floor(100000 + Math.random() * 900000).toString() // 6 digit code

        const existingUserVerfiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerfiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already exists"
            },
                {
                    status: 400
                })
        }

        const existingUserVerfiedByEmail = await UserModel.findOne({
            email
        })

        if (existingUserVerfiedByEmail) {
            if (existingUserVerfiedByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email already exists"
                },
                    {
                        status: 400
                    })
            } else{
                existingUserVerfiedByEmail.password = hashedPassword
                existingUserVerfiedByEmail.verificationCodeExpiry = new Date(Date.now() + 3600000)
                existingUserVerfiedByEmail.verificationCode = code
                await existingUserVerfiedByEmail.save()
            }
        } else {
           
            const user = new UserModel({
                username,
                email,
                password: hashedPassword,
                verificationCodeExpiry: expiryDate,
                verificationCode: code,
                messages: []
            })

            await user.save()

        }

        const emailResponse = await sendVerificationEmail(email, username, code)
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            },
                {
                    status: 500
                })
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verfiy your email to login"
        },
            {
                status: 201
            })

    } catch (error) {
        console.log("Error registering user", error)
        return Response.json({
            success: false,
            message: "registering user"
        },
            {
                status: 500
            })
    }
}