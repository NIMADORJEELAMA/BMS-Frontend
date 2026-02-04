"use client";
import {
  Calendar as CalendarIcon,
  FilterX,
  ArrowRight,
  Search,
} from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onClear: () => void;
  onSubmit: () => void; // New prop
  loading?: boolean; // Optional loading state
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onClear,
  onSubmit,
  loading,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-2 pl-4 rounded-[28px] border border-gray-100 shadow-sm w-fit">
      <div className="flex items-center gap-3 px-2">
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="bg-transparent text-[11px] font-black uppercase tracking-tight outline-none text-gray-700"
          />
        </div>

        <div className="text-gray-300 mx-1">
          <ArrowRight size={14} />
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-gray-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="bg-transparent text-[11px] font-black uppercase tracking-tight outline-none text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 border-l pl-2">
        {(startDate || endDate) && (
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-red-500 transition-all"
            title="Clear"
          >
            <FilterX size={18} />
          </button>
        )}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            "..."
          ) : (
            <>
              <Search size={14} /> Fetch
            </>
          )}
        </button>
      </div>
    </div>
  );
}
