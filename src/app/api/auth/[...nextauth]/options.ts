import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> { // Use your extended User type
        await dbConnect();

        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier }
          ]
        }).lean();

        if (!user) {
          throw new Error("User not found");
        }

        // Map database user to NextAuth User type
        const userForNextAuth = {
          id: user._id.toString(), // Map to expected 'id' field
          email: user.email,
          name: user.username,
          isVerified: user.isVerified,
          isAcceptingMessage: user.isAcceptingMessage,
          username: user.username,
          _id: user._id.toString() // Keep _id for your custom properties
        };

        if (!userForNextAuth.isVerified) {
          throw new Error("Account not verified");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Incorrect password");
        }

        return userForNextAuth;
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
        // Map both id and _id for backward compatibility
        token.id = user.id;
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
          id: token.id,
          isVerified: token.isVerified,
          isAcceptingMessage: token.isAcceptingMessage,
          username: token.username
        }
      };
    }
  }
};