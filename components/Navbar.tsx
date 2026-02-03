// components/Navbar.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Retrieve user info from localStorage (safety check for SSR)
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
      <div className="text-gray-500 font-medium">
        Welcome back, {user?.name || "Admin"}
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <span className="text-gray-700 hidden sm:block">{user?.email}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile Settings
            </button>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
