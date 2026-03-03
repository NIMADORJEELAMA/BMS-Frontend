"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

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
  const history = data?.history || [];

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

  // Revenue by Date
  const revenueByDate = history.reduce((acc: any, item: any) => {
    const date = formatDate(item.checkOut);
    if (!acc[date]) acc[date] = 0;
    acc[date] += item.totalBill;
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
        cellRenderer: (params: any) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">
              {params.data.guestName}
            </span>
            <span className="text-xs text-slate-400">
              {params.data.guestPhone}
            </span>
          </div>
        ),
      },
      {
        headerName: "Room",
        valueGetter: (params) => params.data.room?.roomNumber,
        width: 120,
        cellClass: "font-medium",
      },
      {
        headerName: "Check-In",
        field: "checkIn",
        valueFormatter: (params) =>
          new Date(params.value).toLocaleDateString("en-IN"),
      },
      {
        headerName: "Check-Out",
        field: "checkOut",
        valueFormatter: (params) =>
          new Date(params.value).toLocaleDateString("en-IN"),
      },
      {
        headerName: "Discount",
        field: "discount",
        width: 130,
        valueFormatter: (params) =>
          params.value > 0 ? `- ₹${params.value.toLocaleString()}` : "—",
        cellClass: "text-red-500 font-medium",
      },
      {
        headerName: "Final Bill",
        field: "totalBill",
        width: 160,
        valueFormatter: (params) =>
          params.value ? `₹${params.value.toLocaleString()}` : "",
        cellClass: "text-right font-bold text-slate-900",
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
    if (!data?.history || data.history.length === 0) return [];

    const totalRevenue = data.history.reduce(
      (sum: number, booking: any) => sum + (booking.totalBill || 0),
      0,
    );

    return [
      {
        guestName: "TOTAL REVENUE",
        totalBill: totalRevenue,
      },
    ];
  }, [data]);
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
            if (dates) {
              setStartDate(dates[0].format("YYYY-MM-DD")); // API format
              setEndDate(dates[1].format("YYYY-MM-DD")); // API format
            }
          }}
          className="rounded-2xl"
        />
      </div>
      {/* HEADER & STATS */}
      <div className="space-y-10">
        {/* HEADER */}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <IndianRupee size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Total Revenue
              </p>
              <p className="text-2xl font-black text-slate-900">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Guests */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Total Bookings
              </p>
              <p className="text-2xl font-black text-slate-900">
                {history.length}
              </p>
            </div>
          </div>

          {/* Checked Out */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Checked Out
              </p>
              <p className="text-2xl font-black text-slate-900">{checkedOut}</p>
            </div>
          </div>
        </div>

        {/* COMPACT CHART SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Booking Status */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold mb-3 text-slate-700">
              Booking Status
            </h2>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Checked Out", value: checkedOut },
                    { name: "Cancelled", value: cancelled },
                  ]}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Mode */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold mb-3 text-slate-700">
              Payment Mode
            </h2>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: "Cash", value: cashTotal },
                  { name: "Online", value: onlineTotal },
                ]}
              >
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
              paginationPageSize={10}
              animateRows
              rowSelection="single"
              pinnedBottomRowData={pinnedBottomRowData}
              onRowClicked={(event) => setSelectedBooking(event.data)}
            />
          </div>
        )}
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
