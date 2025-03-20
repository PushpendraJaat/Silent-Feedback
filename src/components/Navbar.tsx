"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { setTheme } = useTheme();
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="p-4 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        {/* Logo Section */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Silent<span className="text-blue-500 dark:text-blue-400">Feedback</span>
        </Link>

        {/* Theme Toggle */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="cursor-pointer text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="cursor-pointer text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="cursor-pointer text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authentication Section */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="hidden md:inline-block text-gray-700 dark:text-gray-300 font-medium">
                  Welcome, {user?.username || user?.email}
                </span>
                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="secondary"
                    className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
