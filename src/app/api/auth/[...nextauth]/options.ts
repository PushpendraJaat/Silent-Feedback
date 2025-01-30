import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Find user by email or username
        const user = await UserModel.findOne({
          $or: [
            { email: credentials.email },
            { username: credentials.email }
          ]
        }).lean();

        if (!user) {
          throw new Error("User not found");
        }

        // Convert MongoDB ObjectId to string
        const userWithId = {
          ...user,
          _id: user._id.toString()
        };

        // Check verification status
        if (!userWithId.isVerified) {
          throw new Error("Account not verified");
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          userWithId.password
        );

        if (!isValidPassword) {
          throw new Error("Incorrect password");
        }

        return userWithId;
      }
    })
  ],
  pages: {
    signIn: "/signin"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          _id: token._id,
          isVerified: token.isVerified,
          isAcceptingMessage: token.isAcceptingMessage,
          username: token.username
        }
      };
    }
  }
};