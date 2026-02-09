"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  History,
  IndianRupee,
  Users,
  Calendar,
  ArrowUpRight,
  Loader2,
  FilterX,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import BookingDetailsModal from "@/components/history/BookingDetailsModal";

export default function BookingHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Wait 500ms after the last keystroke

    return () => clearTimeout(handler); // Cleanup if the user types again
  }, [searchTerm]);
  const { data, isLoading } = useQuery({
    // 3. Use 'debouncedSearch' in the queryKey instead of 'searchTerm'
    queryKey: ["booking-history", debouncedSearch, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      return (await api.get(`/rooms/history?${params.toString()}`)).data;
    },
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  //   if (isLoading)
  //     return (
  //       <div className="h-96 flex items-center justify-center">
  //         <Loader2 className="animate-spin text-slate-300" size={40} />
  //       </div>
  //     );

  return (
    <div className="space-y-8">
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
            Archive
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Completed Stays & Revenue
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">
                Total Revenue
              </p>
              <p className="text-xl font-black italic text-slate-900">
                ₹{data?.stats?.totalRevenue?.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">
                Total Guests
              </p>
              <p className="text-xl font-black italic text-slate-900">
                {data?.stats?.totalBookings}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            placeholder="Search Guest Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <input
            type="date"
            className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-slate-300 text-xs font-black">TO</span>
          <input
            type="date"
            className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        {(searchTerm || startDate || endDate) && (
          <button
            onClick={clearFilters}
            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            <FilterX size={18} />
          </button>
        )}
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-6">Guest / Contact</th>
              <th className="px-8 py-6">Room</th>
              <th className="px-8 py-6">Check-In / Out</th>
              <th className="px-8 py-6">Discount</th>
              <th className="px-8 py-6 text-right">Final Bill</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.history.map((booking: any) => (
              <tr
                key={booking.id}
                onClick={() => setSelectedBooking(booking)} // Click to open
                className="group hover:bg-slate-50 cursor-pointer transition-all"
              >
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-slate-900 uppercase italic">
                    {booking.guestName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {booking.guestPhone}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black italic text-slate-600 uppercase">
                    {booking.room.roomNumber}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <ArrowUpRight size={10} className="text-emerald-500" />
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <Calendar size={10} className="text-red-400" />
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-black text-red-400 italic">
                    {booking.discount > 0 ? `- ₹${booking.discount}` : "—"}
                  </p>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="text-lg font-black italic text-slate-900">
                    ₹{booking.totalBill}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
