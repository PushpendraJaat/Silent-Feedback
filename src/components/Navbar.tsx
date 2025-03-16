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
    <nav className="p-4 md:p-6 bg-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link href="/" className="text-2xl font-extrabold text-gray-800 tracking-wide hover:text-gray-600 transition duration-300">
          Secret Message
        </Link>

        {/* Authentication Section */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="hidden md:inline-block text-gray-700 font-medium">
                Welcome, {user?.username || user?.email}
              </span>
              <Button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white transition-transform duration-300 transform hover:scale-[1.05]"
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/signin">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white transition-transform duration-300 transform hover:scale-[1.05]">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
