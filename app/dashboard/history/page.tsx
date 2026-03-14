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
import {
  IndianRupee,
  Users,
  TrendingUp,
  Loader2,
  Eye,
  Printer,
} from "lucide-react";
import GenericDropdown from "@/components/ui/GenericDropdown";

import BookingHistoryModal from "../bookings/BookingHistoryModal";

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
  const [status, setStatus] = useState("ALL");
  const [managerBookingId, setManagerBookingId] = useState<string | null>(null);
  const gridRef = useRef<AgGridReactType>(null);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Wait 500ms after the last keystroke

    return () => clearTimeout(handler); // Cleanup if the user types again
  }, [searchTerm]);

  const STATUS_OPTIONS = [
    { id: "RESERVED", name: "Reserved" },
    { id: "CHECKED_IN", name: "Checked In" },
    { id: "CHECKED_OUT", name: "Checked Out" },
    { id: "CANCELLED", name: "Cancelled" },
  ];
  const { data, isLoading } = useQuery({
    queryKey: ["booking-history", debouncedSearch, startDate, endDate, status],
    queryFn: async () => {
      // This ensures 'status' is sent as a query parameter string
      const response = await api.get("/rooms/history", {
        params: {
          search: debouncedSearch,
          startDate,
          endDate,
          status: status, // "ALL", "CANCELLED", etc.
        },
      });
      return response.data;
    },
  });
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
      // Inside your useMemo(() => [ ... ], [])
      {
        headerName: "Status",
        field: "status",
        width: 140,

        // For AG Grid Community, use 'agTextColumnFilter' or a custom floating filter
        cellRenderer: (params: any) => {
          if (params.node.isRowPinned()) return "";

          const status = params.value;
          const styles: any = {
            CHECKED_OUT: "  text-emerald-700 ",
            CANCELLED: " text-red-700  ",
            BOOKED: " text-blue-700  ",
          };

          return (
            <div className="flex items-center h-full">
              <span
                className={`px-2 py-1   text-[10px] font-bold   ${styles[status]}`}
              >
                {status?.replace("_", " ")}
              </span>
            </div>
          );
        },
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
      {
        headerName: "Actions",
        field: "id",
        width: 160,
        colId: "actions",
        cellClass: "actions-cell",
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: any) => {
          if (params.node.isRowPinned()) return null;

          return (
            <div className="flex items-center text-center gap-2 ">
              {/* EYE ICON: Opens Manager Modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // CRITICAL: Prevents onRowClicked from firing
                  setManagerBookingId(params.value);
                }}
                className="p-2   rounded-full text-blue-600 hover:bg-blue-300 text-blue-800 transition-colors cursor-pointer"
                title="Open Manager"
              >
                <Eye size={18} />
              </button>

              {/* PRINTER ICON: Opens Booking Details (Same as Row Click) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop bubbling to prevent double-firing
                  setSelectedBooking(params.data); // Manually trigger the details modal
                }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:bg-slate-500 text-slate-800 transition-colors cursor-pointer"
                title="Print/View Details"
              >
                <Printer size={18} />
              </button>
            </div>
          );
        },
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
    <div className="space-y-8 p-4 gap-2">
      <BookingHistoryModal
        isOpen={!!managerBookingId}
        bookingId={managerBookingId}
        onClose={() => setManagerBookingId(null)}
      />
      {/* FILTER BAR */}
      <div className="   flex justify-end">
        <div className="mr-2">
          <GenericDropdown
            options={STATUS_OPTIONS}
            selectedValue={status}
            onSelect={setStatus}
            allLabel="All Status"
            placeholder="Filter by Status"
            className="w-48" // Narrower width for the status filter
          />
        </div>
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
              // onRowClicked={(event) => setSelectedBooking(event.data)}
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
