"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  format,
  addDays,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  isWeekend,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Calendar as CalendarIcon,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CheckInModal from "@/components/rooms/CheckInModal";
import { BookingHoverCard } from "./BookingHoverCard";
import BookingManagerModal from "./BookingManagerModal";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "antd";
import dayjs from "dayjs";

<<<<<<< HEAD
export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
=======
export default function ReservationTimeline() {
  const [viewDate, setViewDate] = useState(startOfDay(new Date()));
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [selection, setSelection] = useState<any>(null);
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee

  const daysToShow = 21; // Increased density for enterprise view

  const dateRange = useMemo(() => {
    return eachDayOfInterval({
      start: viewDate,
      end: addDays(viewDate, daysToShow - 1),
    });
  }, [viewDate]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["room-timeline", format(viewDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const res = await api.get("/rooms/timeline", {
        params: {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[daysToShow - 1].toISOString(),
        },
      });
      return res.data;
    },
  });

<<<<<<< HEAD
  const handleCheckOut = (booking: any) => {
    // if (window.confirm(`Process checkout for ${booking.guestName}?`)) {
    checkoutMutation.mutate(booking.id);
    // }
  };
=======
  // Enterprise filtering logic
  const filteredRooms = useMemo(() => {
    if (!data?.rooms) return [];
    return data.rooms.filter(
      (room: any) =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.category?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data?.rooms, searchTerm]);
  const handleAddBookingClick = () => {
    // Option A: Pass null to let the user choose a room inside the modal
    setSelection(null);
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee

    // Option B: Pre-select the first room if rooms are loaded
    if (filteredRooms.length > 0) {
      setSelection({
        roomId: filteredRooms[0].id,
        roomNumber: filteredRooms[0].roomNumber,
        date: viewDate, // Current view start date
      });
    }

    setIsCheckInOpen(true);
  };
  if (isLoading)
    return (
      <div className="flex h-[600px] items-center justify-center bg-slate-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-sm font-medium text-slate-500">
            Loading floor map...
          </p>
        </div>
      </div>
    );

<<<<<<< HEAD
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">Guest Details</th>
              <th className="px-8 py-5">Room</th>
              <th className="px-8 py-5">Check-In Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-200" />
                </td>
              </tr>
            ) : (
              bookings.map((booking: any) => (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900 uppercase italic">
                      {booking.guestName}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                      <Phone size={10} /> {booking.guestPhone || "No Phone"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black italic">
                      ROOM {booking.room.roomNumber}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">
                    {new Date(booking.checkIn).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setActiveBookingId(booking.id)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                    >
                      View Bill & Checkout
                    </button>
                  </td>
                </tr>
              ))
=======
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
      {/* 1. TOP ENTERPRISE TOOLBAR */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white z-30 sticky top-0">
        {/* LEFT: Search Section */}
        <div className="flex flex-1 items-center justify-start gap-4">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <Input
              placeholder="Search room or type..."
              className="pl-9 h-9 text-xs border-slate-200 focus:ring-indigo-500 rounded-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MIDDLE: Date Navigation Section */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
            {/* <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[10px] font-black uppercase hover:bg-white transition-all rounded-lg"
              onClick={() => setViewDate(startOfDay(new Date()))}
            >
              Today
            </Button> */}

            {/* <div className="h-4 w-[1px] bg-slate-300 mx-1" /> */}

            <div className="flex items-center gap-0.5 ">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white rounded-lg"
                onClick={() => setViewDate(addDays(viewDate, -7))}
              >
                <ChevronLeft size={16} />
              </Button>

              <DatePicker
                value={dayjs(viewDate)}
                onChange={(date) => {
                  if (date) setViewDate(date.toDate());
                }}
                allowClear={false}
                format="DD MMM YYYY"
                picker="date"
                className="h-8 border-none bg-transparent hover:bg-white focus:bg-white font-bold text-[11px] uppercase w-[140px] text-center cursor-pointer shadow-none rounded-md"
                suffixIcon={
                  <CalendarIcon size={14} className="text-indigo-600" />
                }
                showToday={true}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white rounded-lg"
                onClick={() => setViewDate(addDays(viewDate, 7))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Action/Sync Section */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 text-xs font-medium border-slate-200 hover:bg-slate-50",
              isFetching && "text-indigo-600 border-indigo-200",
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee
            )}
            onClick={() => refetch()}
          >
            <RefreshCcw
              size={14}
              className={cn(isFetching && "animate-spin")}
            />
            <span>Sync</span>
          </Button>
        </div>
      </div>
      {/* 2. TIMELINE GRID */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="inline-flex flex-col min-w-full">
          {/* HEADER ROW (Sticky) */}
          <div className="flex sticky top-0 z-40 bg-white shadow-sm">
            <div className="w-42 flex-shrink-0 bg-slate-50 border-r border-b border-slate-200 p-4 flex items-end">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Room Inventory
              </span>
            </div>
            <div className="flex flex-1">
              {dateRange.map((date) => (
                <div
                  key={date.toString()}
                  className={cn(
                    "flex-1 min-w-[60px] text-center py-2 border-r border-b border-slate-200 transition-colors",
                    isSameDay(date, new Date())
                      ? "bg-indigo-50/50"
                      : "bg-slate-50/30",
                    isWeekend(date) && "bg-slate-100/20",
                  )}
                >
                  <div
                    className={cn(
                      "text-[10px] uppercase font-bold mb-0.5",
                      isWeekend(date) ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    {format(date, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black",
                      isSameDay(date, new Date())
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700",
                    )}
                  >
                    {format(date, "d")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROOM ROWS */}
          {filteredRooms.map((room: any) => (
            <div
              key={room.id}
              className="flex border-b border-slate-100 group transition-colors hover:bg-slate-50/80"
            >
              {/* Room Info Sidebar (Sticky left) */}
              <div className="w-42 flex-shrink-0 border-r border-slate-200 p-3 bg-white sticky left-0 z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                      {room.roomNumber}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                        "bg-slate-100 text-slate-500 border border-slate-200",
                      )}
                    >
                      {room.category?.name.split(" ")[0]}
                    </span>
                  </div>
                  {/* <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: room.category?.color }}
                  /> */}
                </div>
                <div className="mt-1 flex gap-8">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                    <div className="w-1 h-1 rounded-full bg-emerald-400" />{" "}
                    Clean
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                    {/* <div className="w-1 h-1 rounded-full bg-slate-600" /> */}
                    ₹{room.basePrice}
                  </div>
                </div>
              </div>

              {/* Booking Cells */}
              <div className="flex flex-1 relative h-14">
                {dateRange.map((date) => (
                  <div
                    key={date.toString()}
                    onClick={() => {
                      setSelection({
                        roomId: room.id,
                        date,
                        roomNumber: room.roomNumber,
                      });
                      setIsCheckInOpen(true);
                    }}
                    className={cn(
                      "flex-1 min-w-[60px] border-r border-slate-100/50 cursor-pointer relative",
                      "hover:bg-indigo-50/40 transition-colors group/cell",
                      isSameDay(date, new Date()) && "bg-indigo-50/20",
                    )}
                  >
                    {/* Ghost "Plus" icon on hover for enterprise feel */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        +
                      </div>
                    </div>
                  </div>
                ))}

                {data.bookings
                  .filter((b: any) => b.roomId === room.id)
                  .map((booking: any) => (
                    <BookingHoverCard
                      key={booking.id}
                      booking={booking}
                      dateRange={dateRange}
                      daysToShow={daysToShow}
                      onManage={(b: any) => {
                        setActiveBooking(b);
                        setIsManageOpen(true);
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FOOTER LEGEND */}
      <div className="p-2 px-4 bg-slate-50 border-t border-slate-200 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Confirmed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Checked Out
          </span>
        </div>
      </div>

<<<<<<< HEAD
      {checkoutData && (
        <CheckOutSummary
          data={checkoutData}
          onClose={() => {
            setCheckoutData(null);
            // Optional: refresh data again on close to be safe
            queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
          }}
          //onClose={() => setCheckoutData(null)}
        />
      )}

      {activeBookingId && (
        <CheckOutSummary
          bookingId={activeBookingId}
          onClose={() => setActiveBookingId(null)}
        />
      )}
=======
      {/* Modals remain the same */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        gridData={selection}
        rooms={filteredRooms}
      />
      <BookingManagerModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        bookingId={activeBooking?.id}
        booking={activeBooking}
      />
>>>>>>> 97a99bd934e32d8f7d070a1410e2da8f161032ee
    </div>
  );
}
