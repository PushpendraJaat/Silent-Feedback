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
                email: { label: "Username", type: "text", placeholder: "username or email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: Promise<any | null>){
                await dbConnect();
                const user = await UserModel.findOne({ 
                    $or: [
                        { username: credentials.identifier },
                        { email: credentials.identifier }
                    ]
                 });
                if (!user) {
                    return null;
                }
                if (!user.isVerified) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }

                return user;
            } 
        })
    ],
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXT_AUTH_SECRET,

    callbacks: {
        async session({ session, token }) {
            if (token) {
              session.user._id = token._id
              session.user.isVerified = token.isVerified
              session.user.isAcceptingMessage = token.isAcceptingMessage
              session.user.username = token.username
            }
            return session
          },
          async jwt({ token, user }) {
            if (user) {
              token._id = user._id?.toString()
              token.isVerified = user.isVerified
              token.isAcceptingMessage = user.isAcceptingMessage
              token.username = user.username
            }
            return token
          }
    }
}