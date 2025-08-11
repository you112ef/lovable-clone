"use client";

import React, { useState } from "react";
import SettingsModal from "./SettingsModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-4">
      {/* Logo & main navigation */}
      <div className="flex items-center gap-6 sm:gap-10">
        <a
          href="/"
          className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-sm bg-gradient-to-br from-orange-400 via-pink-500 to-blue-500" />
          Lovable
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#" className="hover:text-white transition-colors">
            Community
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Enterprise
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Learn
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Shipped
          </a>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4 text-sm">
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-900 border border-gray-800 text-gray-200 rounded-lg hover:bg-gray-800"
        >
          Settings
        </button>
        <a
          href="#"
          className="text-gray-300 hover:text-white transition-colors hidden sm:inline"
        >
          Log in
        </a>
        <a
          href="#"
          className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get started
        </a>
      </div>

      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </nav>
  );
}
