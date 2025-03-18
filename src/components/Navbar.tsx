"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="p-4 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-gray-800 hover:text-gray-600 transition-colors"
        >
          Silent Feedback
        </Link>

        {/* Authentication Section */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden md:inline-block text-gray-700 font-medium">
                Welcome, {user?.username || user?.email}
              </span>
              <Button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gray-800 hover:bg-gray-900 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
