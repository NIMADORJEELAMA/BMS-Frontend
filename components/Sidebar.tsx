// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Table,
//   UtensilsCrossed,
//   FileText,
//   BarChart3,
//   CalendarDays,
//   Box,
//   ChefHat,
//   Users,
//   Clock,
//   DoorOpen,
//   ClipboardCheck,
//   History,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { ClassValue } from "clsx";
// import clsx from "clsx";
// import { twMerge } from "tailwind-merge";
// // Assumes you have the cn helper we used earlier
// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export default function Sidebar() {
//   const pathname = usePathname();
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   const [isHovered, setIsHovered] = useState(false);

//   // Determine if the sidebar should appear "open"
//   // It opens if manually toggled OR if hovered while collapsed
//   const isOpen = !isCollapsed || isHovered;

//   const menuItems = [
//     { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//     { name: "Tables", href: "/dashboard/tables", icon: Table },
//     { name: "Menu Items", href: "/dashboard/menu", icon: UtensilsCrossed },
//     { name: "Bill", href: "/dashboard/bills", icon: FileText },
//     // { name: "Food Report", href: "/dashboard/reports", icon: BarChart3 },
//     { name: "Sales Report", href: "/dashboard/salesReport", icon: BarChart3 },

//     {
//       name: "Food Report",
//       href: "/dashboard/customReport",
//       icon: CalendarDays,
//     },
//     { name: "Stock", href: "/dashboard/Stock", icon: Box },
//     { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
//     { name: "Users", href: "/dashboard/staff", icon: Users },
//     { name: "Attendance", href: "/dashboard/operations", icon: Clock },
//     { name: "Rooms", href: "/dashboard/rooms", icon: DoorOpen },
//     { name: "Check In", href: "/dashboard/bookings", icon: ClipboardCheck },
//     { name: "History", href: "/dashboard/history", icon: History },
//   ];

//   return (
//     <aside
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       className={cn(
//         "bg-slate-900 text-white min-h-screen hidden md:flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800",
//         isOpen ? "w-64" : "w-20",
//       )}
//     >
//       {/* HEADER SECTION */}
//       <div className="p-6 flex items-center justify-between overflow-hidden h-24">
//         <div
//           className={cn(
//             "transition-opacity duration-300",
//             isOpen ? "opacity-100" : "opacity-0 w-0",
//           )}
//         >
//           <h2 className="text-xl font-bold text-blue-400 whitespace-nowrap">
//             Hill Top Eco Tourism
//           </h2>
//           {/* <p className="text-xs text-slate-400 whitespace-nowrap">
//             Admin Portal
//           </p> */}
//         </div>

//         {/* Toggle Button */}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
//         >
//           {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* NAVIGATION SECTION */}
//       <nav className="mt-4 flex-1">
//         {menuItems.map((item) => {
//           const isActive = pathname === item.href;
//           const Icon = item.icon;

//           return (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={cn(
//                 "flex items-center px-6 py-4 transition-all duration-200 border-l-4 group relative",
//                 isActive
//                   ? "bg-slate-800 border-blue-500 text-white"
//                   : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800",
//               )}
//             >
//               <Icon
//                 size={22}
//                 className={cn(
//                   "min-w-[22px]",
//                   isActive ? "text-blue-400" : "group-hover:text-blue-300",
//                 )}
//               />

//               <span
//                 className={cn(
//                   "ml-4 transition-all duration-300 whitespace-nowrap overflow-hidden",
//                   isOpen ? "opacity-100 w-auto" : "opacity-0 w-0",
//                 )}
//               >
//                 {item.name}
//               </span>

//               {/* Tooltip for collapsed mode */}
//               {!isOpen && (
//                 <div className="absolute left-full ml-4 px-2 py-1 bg-blue-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
//                   {item.name}
//                 </div>
//               )}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

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
  Settings,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

<<<<<<< HEAD
    { name: "Kitchen", href: "/dashboard/kitchen" },
    { name: "Users", href: "/dashboard/staff" },
    { name: "Attendance", href: "/dashboard/operations" },
    { name: "Rooms", href: "/dashboard/rooms" },
    { name: "Check In", href: "/dashboard/bookings" },
    { name: "Bookings History", href: "/dashboard/history" },
=======
  const isOpen = !isCollapsed || isHovered;

  // Grouped Navigation for better UX
  const menuGroups = [
    {
      label: "Main",
      items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Hospitality",
      items: [
        { name: "Rooms", href: "/dashboard/rooms", icon: DoorOpen },
        { name: "Check In", href: "/dashboard/bookings", icon: ClipboardCheck },
        { name: "History", href: "/dashboard/history", icon: History },
      ],
    },
    {
      label: "Restaurant",
      items: [
        { name: "Tables", href: "/dashboard/tables", icon: Table },
        { name: "Kitchen", href: "/dashboard/kitchen", icon: ChefHat },
        { name: "Menu Items", href: "/dashboard/menu", icon: UtensilsCrossed },
      ],
    },
    {
      label: "Reports ",
      items: [
        { name: "Bill", href: "/dashboard/bills", icon: FileText },
        {
          name: "Sales Report",
          href: "/dashboard/salesReport",
          icon: BarChart3,
        },
        {
          name: "Food Report",
          href: "/dashboard/customReport",
          icon: CalendarDays,
        },
      ],
    },
    {
      label: "Inventory",
      items: [{ name: "Stock", href: "/dashboard/Stock", icon: Box }],
    },
    {
      label: "Inventory & Staff",
      items: [
        { name: "Users", href: "/dashboard/staff", icon: Users },
        { name: "Attendance", href: "/dashboard/operations", icon: Clock },
      ],
    },
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "bg-[#0f172a] text-slate-300 min-h-screen hidden md:flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 sticky top-0 h-screen",
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* BRANDING HEADER */}
      {/* HEADER SECTION */}
      <div className="h-20 flex items-center justify-between px-4 overflow-hidden border-b border-slate-800/50 relative">
        {/* Logo/Title Container */}
        <div
          className={cn(
            "transition-all duration-300 flex flex-col min-w-[140px]",
            isOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-10 pointer-events-none",
          )}
        >
          <span className="text-blue-500 font-bold text-lg leading-tight truncate">
            Hill Top
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            Eco Tourism
          </span>
        </div>

        {/* Toggle Button - Absolute positioning when collapsed ensures it stays centered */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all border border-slate-700 z-10",
            !isOpen && "absolute left-1/2 -translate-x-1/2", // This locks it to the center when collapsed
          )}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      {/* NAVIGATION SECTION */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar no-scrollbar">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {/* Group Label */}
            <p
              className={cn(
                "px-6 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-opacity",
                isOpen ? "opacity-100" : "opacity-0",
              )}
            >
              {group.label}
            </p>

            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-6 py-3 my-1 transition-all duration-200 group relative",
                    isActive
                      ? "text-white bg-blue-600/10"
                      : "hover:bg-slate-800/50 hover:text-white",
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                  )}

                  <Icon
                    size={20}
                    className={cn(
                      "min-w-[20px] transition-colors",
                      isActive
                        ? "text-blue-500"
                        : "text-slate-500 group-hover:text-blue-400",
                    )}
                  />

                  <span
                    className={cn(
                      "ml-4 text-sm font-medium transition-all duration-300 whitespace-nowrap",
                      isOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 w-0",
                    )}
                  >
                    {item.name}
                  </span>

                  {/* Tooltip for collapsed mode */}
                  {!isOpen && (
                    <div className="absolute left-16 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* FOOTER - USER PROFILE OR SETTINGS */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center w-full px-2 py-2 text-slate-400 hover:text-white transition-colors group">
          <Settings size={20} />
          {isOpen && <span className="ml-4 text-sm font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
