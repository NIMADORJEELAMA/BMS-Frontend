import clsx, { ClassValue } from "clsx";
import { Search } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Input } from "../ui/input";
import { SearchBar } from "../ui/SearchBar";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardHeader({
  searchQuery,
  setSearchQuery,
  areaType,
  setAreaType,
  statusFilter,
  setStatusFilter,
}: any) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* LEFT: Search Bar */}
      <div className="relative w-full md:w-64">
        <SearchBar
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* RIGHT: Filters Group */}
      <div className="flex items-center gap-6">
        {/* Area Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Type
          </span>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["all", "rooms", "tables"].map((type) => (
              <button
                key={type}
                onClick={() => setAreaType(type)}
                className={cn(
                  "px-4 py-1.5 text-xs rounded-md transition capitalize",
                  areaType === type
                    ? "bg-white shadow-sm text-blue-600 font-bold"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-[1px] bg-gray-200 hidden lg:block" />

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Status
          </span>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["all", "FREE", "OCCUPIED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition capitalize",
                  statusFilter === status
                    ? "bg-white shadow-sm text-blue-600 font-bold"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
