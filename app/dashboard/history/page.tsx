"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
<<<<<<< HEAD
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
=======

import { useEffect, useState } from "react";
import BookingDetailsModal from "@/components/history/BookingDetailsModal";
import "@/lib/agGrid";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useMemo } from "react";
import { useRef } from "react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { IndianRupee, Users, TrendingUp, Loader2 } from "lucide-react";

const COLORS = ["#10b981", "#ef4444"];

// import "antd/dist/reset.css";

const { RangePicker } = DatePicker;

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB");
  // gives dd/mm/yyyy
};
export default function BookingHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const gridRef = useRef<AgGridReactType>(null);
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee
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
<<<<<<< HEAD

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
      {/* DETAILED MODAL */}
=======
  const history = data?.history || [];
  console.log("history", history);
  const totalRevenue = history.reduce(
    (acc: any, item: any) => acc + item.totalBill,
    0,
  );

  const checkedOut = history.filter(
    (i: any) => i.status === "CHECKED_OUT",
  ).length;
  const cancelled = history.filter((i: any) => i.status === "CANCELLED").length;

  const cashTotal = history.reduce(
    (acc: any, i: any) => acc + (i.cashAmount || 0),
    0,
  );
  const onlineTotal = history.reduce(
    (acc: any, i: any) => acc + (i.onlineAmount || 0),
    0,
  );

  const totalNetRevenue = history.reduce(
    (acc: any, item: any) => acc + (item.grandTotal || 0),
    0,
  );

  const totalDiscounts = history.reduce(
    (acc: any, item: any) => acc + (item.discount || 0),
    0,
  );

  // Revenue by Date Chart - Now using the discounted amount (Grand Total)
  const revenueByDate = history.reduce((acc: any, item: any) => {
    const date = formatDate(item.checkOut);
    if (!acc[date]) acc[date] = 0;
    acc[date] += item.grandTotal || 0;
    return acc;
  }, {});

  const revenueChartData = Object.keys(revenueByDate).map((date) => ({
    date,
    revenue: revenueByDate[date],
  }));
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Guest",
        field: "guestName",
        flex: 1.5,
        // Bold the "TOTALS" label
        cellStyle: (params) =>
          params.node.isRowPinned()
            ? { fontWeight: "bold", fontSize: "14px" }
            : null,
        cellRenderer: (params: any) => {
          if (params.node.isRowPinned()) return <span>{params.value}</span>;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {params.data.guestName}
              </span>
              <span className="text-xs text-slate-400">
                {params.data.guestPhone}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Check-In",
        field: "checkIn",
        // Fix: Don't try to format a date if it's the pinned row
        filter: false,
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value).toLocaleDateString("en-IN")
            : "",
      },
      {
        headerName: "Check-Out",
        field: "checkOut",
        filter: false,
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value).toLocaleDateString("en-IN")
            : "",
      },
      {
        headerName: "Discount",
        field: "discount",
        width: 120,
        cellClass: "text-red-500 font-medium",
        filter: false,
        // Bold if pinned
        cellStyle: (params) =>
          params.node.isRowPinned() ? { fontWeight: "bold" } : null,
        valueFormatter: (params) =>
          params.value > 0 ? `- ₹${params.value.toLocaleString()}` : "—",
      },
      {
        headerName: "Advance",
        field: "advanceAmount", // Match the key in pinnedRowData
        filter: false,
        width: 140,
        cellStyle: (params) =>
          params.node.isRowPinned() ? { fontWeight: "bold" } : null,
        valueFormatter: (params) => `₹${(params.value || 0).toLocaleString()}`,
      },
      {
        headerName: "Cash",
        field: "cashAmount", // Match the key in pinnedRowData
        filter: false,
        width: 140,
        cellStyle: (params) =>
          params.node.isRowPinned() ? { fontWeight: "bold" } : null,
        valueFormatter: (params) => `₹${(params.value || 0).toLocaleString()}`,
      },
      {
        headerName: "Online",
        field: "onlineAmount", // Match the key in pinnedRowData
        filter: false,
        width: 140,
        cellStyle: (params) =>
          params.node.isRowPinned() ? { fontWeight: "bold" } : null,
        valueFormatter: (params) => `₹${(params.value || 0).toLocaleString()}`,
      },
      {
        headerName: "Grand Total",
        field: "grandTotal",
        filter: false,
        width: 160,
        // Keep your existing highlighting but add extra weight for the total
        cellClass: (params) =>
          params.node.isRowPinned()
            ? "text-right font-black text-emerald-800 bg-emerald-100"
            : "text-right font-bold text-emerald-700 bg-emerald-50/30",
        valueFormatter: (params) =>
          params.value ? `₹${params.value.toLocaleString()}` : "",
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: true,
      resizable: true,
    }),
    [],
  );

  const pinnedBottomRowData = useMemo(() => {
    if (!history.length) return [];

    return [
      {
        guestName: "TOTALS",
        // Providing empty strings/null prevents the "Invalid Date" error in date columns
        checkIn: "",
        checkOut: "",
        room: { roomNumber: "" },

        // Summing the numeric values
        discount: history.reduce(
          (s: number, b: any) => s + (b.discount || 0),
          0,
        ),
        advanceAmount: history.reduce(
          (s: number, b: any) => s + (b.advanceAmount || 0),
          0,
        ),
        cashAmount: history.reduce(
          (s: number, b: any) => s + (b.cashAmount || 0),
          0,
        ),
        onlineAmount: history.reduce(
          (s: number, b: any) => s + (b.onlineAmount || 0),
          0,
        ),
        grandTotal: totalNetRevenue,
      },
    ];
  }, [history, totalNetRevenue]);
  return (
    <div className="space-y-8 p-4">
      {/* FILTER BAR */}
      <div className="   flex justify-end">
        <RangePicker
          size="large"
          format="DD/MM/YYYY"
          allowClear={false}
          defaultValue={[dayjs().subtract(7, "day"), dayjs()]}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setStartDate(dates[0].format("YYYY-MM-DD"));
              setEndDate(dates[1].format("YYYY-MM-DD"));
            }
          }}
          className="rounded-2xl"
        />
      </div>
      {/* HEADER & STATS */}
      <div className="space-y-10">
        {/* HEADER */}

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Revenue */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <IndianRupee size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Net Revenue
              </p>
              <p className="text-2xl font-black text-slate-900 leading-tight">
                ₹{totalNetRevenue.toLocaleString()}
              </p>
              {totalDiscounts > 0 && (
                <p className="text-[10px] text-red-400 font-semibold mt-1">
                  ₹{totalDiscounts.toLocaleString()} discount
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Bookings */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Bookings
              </p>
              <p className="text-2xl font-black text-slate-900 leading-tight">
                {history.length}
              </p>
            </div>
          </div>

          {/* Card 3: Checked Out */}
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Checked Out
              </p>
              <p className="text-2xl font-black text-slate-900 leading-tight">
                {checkedOut}
              </p>
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold mb-3 text-slate-700">
              Booking Status
            </h2>

            <ResponsiveContainer width="100%" height={100}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Checked Out", value: checkedOut },
                    { name: "Cancelled", value: cancelled },
                  ]}
                  dataKey="value"
                  innerRadius={20}
                  outerRadius={40}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COMPACT CHART SECTION */}
      </div>

      {/* HISTORY TABLE */}
      <div className=" ">
        {isLoading ? (
          <div className="h-[500px] flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : (
          <div
            className="ag-theme-quartz enterprise-grid"
            style={{ height: 550, width: "100%" }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={data?.history || []}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination
              paginationPageSize={20}
              animateRows
              rowSelection="single"
              pinnedBottomRowData={pinnedBottomRowData}
              onRowClicked={(event) => setSelectedBooking(event.data)}
            />
          </div>
        )}
      </div>
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
