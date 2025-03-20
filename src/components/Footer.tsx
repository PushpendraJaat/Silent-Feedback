import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 shadow-sm py-6">
      <div className="container mx-auto flex justify-center items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            Silent Feedback
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
