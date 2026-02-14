"use client";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Mapping routes to friendly titles
  const routeTitles: { [key: string]: string } = {
    "/dashboard": "Dashboard Overview",
    "/dashboard/tables": "Table Management",
    "/dashboard/menu": "Menu Items",
    "/dashboard/bills": "Billing & Invoices",
    "/dashboard/reports": "Sales Reports",
    "/dashboard/customReport": "Monthly Analysis",
    "/dashboard/Stock": "Inventory & Stock",
    "/dashboard/kitchen": "Kitchen Display",
    "/dashboard/staff": "User Management",
    "/dashboard/operations": "Attendance Tracker",
    "/dashboard/rooms": "Room Management",
    "/dashboard/bookings": "Check-In Desk",
    "/dashboard/history": "System History",
  };

  // Fallback to "Admin Panel" if the route isn't in our list
  const currentTitle = routeTitles[pathname] || "Admin Panel";

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
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-200 ">
      {/* Updated Dynamic Title */}
      <div className="text-gray-800 font-semibold text-lg">{currentTitle}</div>

      <div className="relative cursor-pointer">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">
            {user?.name?.charAt(0) || "U"}
          </div>
          <span className="text-gray-700 hidden sm:block">{user?.email}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50 cursor-pointer">
            <div className="px-4 py-2 text-xs text-gray-400">
              Signed in as {user?.name}
            </div>
            <hr className="my-1" />
            {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile Settings
            </button> */}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
