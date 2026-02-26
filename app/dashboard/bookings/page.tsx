"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  format,
  addDays,
  startOfDay,
  differenceInDays,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CheckInModal from "@/components/rooms/CheckInModal";

export default function ReservationTimeline() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selection, setSelection] = useState<{
    roomId: string;
    date: Date;
  } | null>(null);
  const [viewDate, setViewDate] = useState(startOfDay(new Date()));
  const daysToShow = 14;
  const handleCellClick = (roomId: string, date: Date) => {
    setSelection({ roomId, date });
    setIsCheckInOpen(true);
  };
  const dateRange = useMemo(() => {
    return eachDayOfInterval({
      start: viewDate,
      end: addDays(viewDate, daysToShow - 1),
    });
  }, [viewDate]);

  const { data, isLoading } = useQuery({
    queryKey: ["room-timeline", viewDate.toISOString()],
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

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  const { rooms = [], bookings = [] } = data || {};

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Timeline Controls */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
          Occupancy Map
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(addDays(viewDate, -7))}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-xs font-bold w-32 text-center">
            {format(dateRange[0], "dd MMM")} -{" "}
            {format(dateRange[daysToShow - 1], "dd MMM")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(addDays(viewDate, 7))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col overflow-x-auto">
        {/* Calendar Header */}
        <div className="flex border-b border-slate-100">
          <div className="w-40 flex-shrink-0 bg-slate-100/50 border-r border-slate-200 p-4 text-[10px] font-black uppercase text-slate-400">
            Room
          </div>
          <div className="flex flex-1">
            {dateRange.map((date) => (
              <div
                key={date.toString()}
                className={cn(
                  "flex-1 min-w-[80px] text-center py-2 border-r border-slate-100",
                  isSameDay(date, new Date()) && "bg-indigo-50",
                )}
              >
                <div className="text-[9px] uppercase font-bold text-slate-400">
                  {format(date, "EEE")}
                </div>
                <div className="text-sm font-black text-slate-800">
                  {format(date, "d")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Rows */}
        {rooms.map((room: any) => (
          <div
            key={room.id}
            className="flex border-b border-slate-50 relative group hover:bg-slate-50/50"
          >
            <div className="w-40 flex-shrink-0 border-r border-slate-200 p-4 bg-white z-10">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: room.category?.color }}
                />
                <span className="text-sm font-black text-slate-900">
                  {room.roomNumber}
                </span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                {room.category?.name}
              </p>
            </div>

            <div className="flex flex-1 relative h-16">
              {dateRange.map((date) => (
                <div
                  key={date.toString()}
                  onClick={() => handleCellClick(room.id, date)}
                  className="flex-1 min-w-[80px] border-r border-slate-100 cursor-cell hover:bg-indigo-50/30 transition-colors z-0"
                />
              ))}

              {/* Booking Bars */}
              {bookings
                .filter((b: any) => b.roomId === room.id)
                .map((booking: any) => {
                  const start = new Date(booking.checkIn);
                  const end = booking.checkOut
                    ? new Date(booking.checkOut)
                    : new Date();

                  const startPos = differenceInDays(
                    startOfDay(start),
                    startOfDay(dateRange[0]),
                  );
                  const duration = Math.max(
                    1,
                    differenceInDays(startOfDay(end), startOfDay(start)),
                  );

                  // Calculate display constraints
                  const left = Math.max(0, (startPos / daysToShow) * 100);
                  const width = (duration / daysToShow) * 100;

                  return (
                    <div
                      key={booking.id}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      className={cn(
                        "absolute top-2 h-12 z-20 rounded-xl border-l-4 p-2 shadow-sm overflow-hidden",
                        booking.status === "CHECKED_IN"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "bg-slate-100 border-slate-400 text-slate-600",
                      )}
                    >
                      <p className="text-[10px] font-black uppercase truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-[8px] font-bold opacity-60">
                        ID: {booking.id.slice(-4)}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => {
          setIsCheckInOpen(false);
          setSelection(null);
        }}
        preselectedData={selection}
      />
    </div>
  );
}
