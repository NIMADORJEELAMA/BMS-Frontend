export default function DashboardHeader({ searchQuery, setSearchQuery }: any) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-8">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">
            minizeo
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Floor Plan
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder="Search table or waiter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
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
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[10px] font-black border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          SYSTEM LIVE
        </div>
      </div>
    </header>
  );
}
