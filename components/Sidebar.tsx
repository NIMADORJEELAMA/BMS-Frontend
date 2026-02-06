// components/Sidebar.tsx
import Link from "next/link";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Tables", href: "/dashboard/tables" },
    { name: "Menu Items", href: "/dashboard/menu" },
    { name: "Bill", href: "/dashboard/bills" },
    { name: "Sales Report", href: "/dashboard/reports" },
    { name: "Sales Report Month", href: "/dashboard/customReport" },
    { name: "Stock", href: "/dashboard/Stock" },

    { name: "Kitchen", href: "/dashboard/kitchen" },
    { name: "Users", href: "/dashboard/staff" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen hidden md:block">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-400">minizeo</h2>
        <p className="text-xs text-slate-400">Admin Portal</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block px-6 py-3 hover:bg-slate-800 transition-colors border-l-4 border-transparent hover:border-blue-500"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
