"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu as MenuIcon, X as XIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

/** 
 * Supreme-level, modern, sleek, reliable navbar
 */
export default function Navbar() {
  const { setTheme } = useTheme();
  const { data: session } = useSession();
  const user: User = session?.user as User;

  // Mobile menu open/close
  const [isOpen, setIsOpen] = useState(false);

  // Animate overlay & menu
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const menuVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  // Desktop link hover animations
  const linkHoverClasses =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-500 dark:after:bg-blue-400 hover:after:w-full after:transition-width after:duration-300";

  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Silent<span className="text-blue-500 dark:text-blue-400">Feedback</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6 text-gray-800 dark:text-gray-100 font-medium">
            <li className={linkHoverClasses}>
              <Link href="/">Home</Link>
            </li>
           
            <li className={linkHoverClasses}>
              <Link href="https://www.pushpendrajaat.in/">Contact</Link>
            </li>
          </ul>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 relative overflow-hidden"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md"
            >
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

          {/* Auth */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Welcome, {user?.username || user?.email}
              </span>
              <Button
                onClick={() => signOut()}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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
            </div>
          )}
        </div>

        {/* Hamburger (Mobile Only) */}
        <button
          className="md:hidden text-gray-800 dark:text-gray-100 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XIcon className="h-6 w-6 transition-transform duration-300 hover:scale-110" />
          ) : (
            <MenuIcon className="h-6 w-6 transition-transform duration-300 hover:scale-110" />
          )}
        </button>
      </div>

      {/* Mobile Overlay & Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-Down Menu */}
            <motion.div
              key="mobileMenu"
              className="absolute top-[4.3rem] left-0 w-full md:hidden"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md px-6 py-6 space-y-6">
                {/* Mobile Nav Links */}
                <ul className="flex flex-col gap-4 text-gray-800 dark:text-gray-100 font-medium">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>

                {/* Theme Toggle (Mobile) */}
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 relative overflow-hidden"
                      >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md mt-2"
                    >
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
                </div>

                {/* Auth Section (Mobile) */}
                {session ? (
                  <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Welcome, {user?.username || user?.email}
                    </p>
                    <Button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      variant="destructive"
                      className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/signin">
                      <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="secondary"
                        className="w-full bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-transform duration-200 hover:scale-105 px-4 py-2 rounded-lg"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
