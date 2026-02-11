"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table,
  UtensilsCrossed,
  FileText,
  BarChart3,
  CalendarDays,
  Box,
  ChefHat,
  Users,
  Clock,
  DoorOpen,
  ClipboardCheck,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
// Assumes you have the cn helper we used earlier
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if the sidebar should appear "open"
  // It opens if manually toggled OR if hovered while collapsed
  const isOpen = !isCollapsed || isHovered;

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tables", href: "/dashboard/tables", icon: Table },
    { name: "Menu Items", href: "/dashboard/menu", icon: UtensilsCrossed },
    { name: "Bill", href: "/dashboard/bills", icon: FileText },
    { name: "Sales Report", href: "/dashboard/reports", icon: BarChart3 },
    {
      name: "Sales Month",
      href: "/dashboard/customReport",
      icon: CalendarDays,
    },
    { name: "Stock", href: "/dashboard/Stock", icon: Box },
    { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
    { name: "Users", href: "/dashboard/staff", icon: Users },
    { name: "Attendance", href: "/dashboard/operations", icon: Clock },
    { name: "Rooms", href: "/dashboard/rooms", icon: DoorOpen },
    { name: "Check In", href: "/dashboard/bookings", icon: ClipboardCheck },
    { name: "History", href: "/dashboard/history", icon: History },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "bg-slate-900 text-white min-h-screen hidden md:flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800",
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* HEADER SECTION */}
      <div className="p-6 flex items-center justify-between overflow-hidden h-24">
        <div
          className={cn(
            "transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 w-0",
          )}
        >
          <h2 className="text-2xl font-bold text-blue-400 whitespace-nowrap">
            minizeo
          </h2>
          <p className="text-xs text-slate-400 whitespace-nowrap">
            Admin Portal
          </p>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* NAVIGATION SECTION */}
      <nav className="mt-4 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-4 transition-all duration-200 border-l-4 group relative",
                isActive
                  ? "bg-slate-800 border-blue-500 text-white"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800",
              )}
            >
              <Icon
                size={22}
                className={cn(
                  "min-w-[22px]",
                  isActive ? "text-blue-400" : "group-hover:text-blue-300",
                )}
              />

              <span
                className={cn(
                  "ml-4 transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0",
                )}
              >
                {item.name}
              </span>

              {/* Tooltip for collapsed mode */}
              {!isOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
