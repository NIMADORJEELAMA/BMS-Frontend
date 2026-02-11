import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
        <input
          type="text"
          placeholder="Search table..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
        <svg
          className="absolute left-3 top-2.5 text-gray-400"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
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
            {["all", "FREE", "OCCUPIED", "BILLED"].map((status) => (
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
