import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-300 shadow-sm py-6">
      <div className="container mx-auto flex justify-center items-center">
        <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">Silent Feedback</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
