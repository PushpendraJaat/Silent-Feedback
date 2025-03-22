"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center px-4"
      >
        <h1 className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-400 animate-pulse">
          404
        </h1>
        <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg md:text-xl">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          It might have been moved or deleted.
        </p>

        <Link href="/">
          <Button className="mt-6 bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-medium transition-transform duration-200 hover:scale-105">
            Go Back Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
