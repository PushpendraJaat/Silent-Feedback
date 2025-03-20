import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { validateCsrfToken } from "@/lib/validateCsrf"; // ✅ Import CSRF validator

export async function POST(request: Request) {
  console.log("Connecting to DB...");

  await dbConnect();

  try {
    // ✅ Validate CSRF token
    validateCsrfToken(request);

    const { username, email, password } = await request.json();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    // ✅ Check if username already exists
    const existingUserVerfiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerfiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }

    // ✅ Check if email already exists
    const existingUserVerfiedByEmail = await UserModel.findOne({
      email,
    });

    if (existingUserVerfiedByEmail) {
      if (existingUserVerfiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 }
        );
      } else {
        // ✅ Update existing unverified user
        existingUserVerfiedByEmail.password = hashedPassword;
        existingUserVerfiedByEmail.verificationCodeExpiry = new Date(
          Date.now() + 3600000
        );
        existingUserVerfiedByEmail.verificationCode = code;
        await existingUserVerfiedByEmail.save();
      }
    } else {
      // ✅ Create a new user
      const user = new UserModel({
        username,
        email,
        password: hashedPassword,
        verificationCodeExpiry: expiryDate,
        verificationCode: code,
        messages: [],
      });

      await user.save();
    }

    // ✅ Send verification email
    const emailResponse = await sendVerificationEmail(email, username, code);
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email to log in.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
}