"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  format,
  addDays,
  differenceInDays, // Add this
  isBefore,
  startOfToday,
} from "date-fns";
import { useState, useMemo, useEffect } from "react";
import { CalendarIcon, LogIn, Moon } from "lucide-react";
import { Input } from "../ui/input";
// ... (Your existing imports: useForm, zod, etc.)

type ModalMode =
  | "SELECTION"
  | "BOOKING_FORM"
  | "CHECK_IN_CONFIRM"
  | "CHECK_OUT_SUMMARY";

interface EnterpriseBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: any[];
  // The data passed from your grid click
  gridData: {
    room: any;
    existingBooking?: any; // If null, the room is empty
    selectedDate: Date;
  } | null;
}

const bookingSchema = z
  .object({
    roomId: z.string().min(1, "Select a room"),
    checkInDate: z.string().min(1, "Check-in is required"),
    checkOutDate: z.string().min(1, "Check-out is required"),

    // Primary Guest
    guestName: z.string().min(2, "Primary name required"),
    guestPhone: z.string().min(10, "Valid phone required"),
    guestEmail: z.string().email("Invalid email").optional().or(z.literal("")),

    // Identity & Billing
    primaryAadhar: z.string().optional(),
    source: z.enum(["WALK_IN", "ONLINE", "AGENCY"]).default("WALK_IN"),
    advanceAmount: z.number().min(0).default(0),

    secondaryGuests: z
      .array(
        z.object({
          name: z.string().min(2, "Name required"),
          idNumber: z.string().optional(),
        }),
      )
      .default([]),
  })
  .refine((data) => new Date(data.checkOutDate) > new Date(data.checkInDate), {
    message: "Check-out must be after check-in",
    path: ["checkOutDate"],
  });

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function EnterpriseBookingModal({
  isOpen,
  onClose,
  rooms,
  gridData, // Expected: { room, existingBooking, selectedDate }
}: any) {
  const [mode, setMode] = useState<ModalMode>("SELECTION");

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      source: "WALK_IN",
      advanceAmount: 0,
      secondaryGuests: [],
    },
  });

  // Reset or Switch Mode based on gridData
  useEffect(() => {
    if (isOpen && gridData) {
      if (gridData.existingBooking) {
        // If someone is in the room, go to Check-Out mode
        setMode(
          gridData.existingBooking.status === "CHECKED_IN"
            ? "CHECK_OUT"
            : "FORM",
        );
        form.reset(gridData.existingBooking);
      } else {
        setMode("SELECTION");
        form.reset({
          roomId: gridData.room?.id,
          checkInDate: format(gridData.selectedDate, "yyyy-MM-dd'T'HH:mm"),
          checkOutDate: format(
            addDays(gridData.selectedDate, 1),
            "yyyy-MM-dd'T'HH:mm",
          ),
        });
      }
    }
  }, [isOpen, gridData, form]);

  // Logic for price calculation
  const staySummary = useMemo(() => {
    const start = new Date(form.watch("checkInDate"));
    const end = new Date(form.watch("checkOutDate"));
    const nights = Math.max(1, differenceInDays(end, start));
    const room = rooms?.find((r: any) => r.id === form.watch("roomId"));
    return { nights, total: (room?.basePrice || 0) * nights };
  }, [
    form.watch("checkInDate"),
    form.watch("checkOutDate"),
    form.watch("roomId"),
    rooms,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        {/* MODE 1: SELECTION */}
        {mode === "SELECTION" && (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Moon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Room {gridData?.room?.roomNumber}
            </h2>
            <p className="text-slate-500 mb-8">
              What would you like to do for this slot?
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button
                onClick={() => setMode("FORM")}
                className="h-32 flex-col bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-slate-900 transition-all rounded-2xl"
              >
                <CalendarIcon className="mb-2 text-indigo-600" />
                <span className="font-bold">New Booking</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-tight">
                  Future Reservation
                </span>
              </Button>
              <Button
                onClick={() => setMode("FORM")}
                className="h-32 flex-col bg-white border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-900 transition-all rounded-2xl"
              >
                <LogIn className="mb-2 text-emerald-600" />
                <span className="font-bold">Direct Check-In</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-tight">
                  Walk-in Guest
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* MODE 2: THE UNIFIED FORM (Booking & Check-In) */}
        {mode === "FORM" && (
          <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
            <div className="bg-slate-900 text-white p-8">
              <Button
                variant="ghost"
                onClick={() => setMode("SELECTION")}
                className="text-slate-400 hover:text-white p-0 mb-6"
              >
                ← Back to Selection
              </Button>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">
                Stay Summary
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">
                    Total Nights
                  </p>
                  <p className="text-xl font-bold">
                    {staySummary.nights} Nights
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">
                    Estimated Amount
                  </p>
                  <p className="text-3xl font-bold text-emerald-400">
                    ₹{staySummary.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-8 bg-white max-h-[80vh] overflow-y-auto">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((d) => console.log("Submit:", d))}
                  className="space-y-6"
                >
                  {/* ... Add your Arrival/Departure and Guest Name Inputs here ... */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Name</FormLabel>
                          <Input {...field} className="rounded-xl" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <Input {...field} className="rounded-xl" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 h-14 rounded-xl text-white font-bold uppercase tracking-widest shadow-lg"
                  >
                    Confirm Registration
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        )}

        {/* MODE 3: CHECK-OUT (The Settlement) */}
        {mode === "CHECK_OUT" && (
          <div className="p-10">
            <h2 className="text-2xl font-bold mb-2">Settlement & Check-Out</h2>
            <p className="text-slate-500 mb-8">
              Room {gridData?.room?.roomNumber} •{" "}
              {gridData?.existingBooking?.guestName}
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span>Room Charges ({staySummary.nights} nights)</span>
                <span className="font-bold">₹{staySummary.total}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Advance Paid</span>
                <span className="font-bold">
                  -₹{gridData?.existingBooking?.advanceAmount || 0}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between text-xl font-black">
                <span>Net Payable</span>
                <span className="text-indigo-600">
                  ₹
                  {staySummary.total -
                    (gridData?.existingBooking?.advanceAmount || 0)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-xl">
                Print Bill
              </Button>
              <Button className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest">
                Process Check-Out
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
