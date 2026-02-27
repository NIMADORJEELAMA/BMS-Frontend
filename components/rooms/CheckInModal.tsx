"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { useState, useEffect } from "react";
import {
  CalendarIcon,
  LogIn,
  User,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  CreditCard,
  Phone,
  MapPin,
  Users,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  roomId: z.string().min(1),
  guestName: z.string().min(2, "Primary guest name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  documentId: z.string().min(1, "Document ID is required"),
  address: z.string().min(2, "City/address is required"),
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  advanceAmount: z.coerce
    .number()
    .min(0, "Amount cannot be negative")
    .default(0),
  paymentMode: z.enum(["CASH", "ONLINE"]).default("CASH"),
  cashAmount: z.coerce.number().min(0).default(0),
  onlineAmount: z.coerce.number().min(0).default(0),
  secondaryGuests: z
    .array(
      z.object({
        name: z.string().min(2, "Name required"),
        documentId: z.string().min(1, "ID required"),
      }),
    )
    .optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

export default function EnterpriseBookingModal({
  isOpen,
  onClose,
  gridData,
}: any) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"SELECTION" | "FORM">("SELECTION");
  const [actionType, setActionType] = useState<"BOOKING" | "CHECKIN">(
    "BOOKING",
  );

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: "",
      guestName: "",
      phone: "",
      documentId: "",
      address: "",
      checkInDate: "",
      checkOutDate: "",
      secondaryGuests: [],
      advanceAmount: 0,
      paymentMode: "CASH",
    },
  });

  console.log("gridData", gridData);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "secondaryGuests",
  });

  const mutation = useMutation({
    mutationFn: (data: BookingValues) => api.post("/rooms/check-in", data),
    onSuccess: () => {
      toast.success("Guest checked in successfully");

      // This will match ANY query key that STARTS with "room-timeline"
      // regardless of the date parameters attached to it.
      queryClient.invalidateQueries({
        queryKey: ["room-timeline"],
      });

      // Keep these if you use them elsewhere
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Check-in failed"),
  });
  useEffect(() => {
    if (isOpen && gridData) {
      // If it's a new selection from the grid, it has 'date'
      // If it's an existing booking, it has 'checkIn'
      const baseDate = gridData.checkIn
        ? new Date(gridData.checkIn)
        : gridData.date;

      // Safety check: if somehow both are missing, use now
      const safeDate =
        baseDate instanceof Date && !isNaN(baseDate.getTime())
          ? baseDate
          : new Date();

      setMode(gridData.id ? "FORM" : "SELECTION"); // Skip selection if it's an existing booking

      form.reset({
        roomId: gridData.roomId || "",
        guestName: gridData.guestName || "",
        phone: gridData.guestPhone || "",
        documentId: gridData.documentId || "",
        address: gridData.address || "",
        checkInDate: format(safeDate, "yyyy-MM-dd'T'HH:mm"),
        checkOutDate: format(
          gridData.checkOut
            ? new Date(gridData.checkOut)
            : addDays(safeDate, 1),
          "yyyy-MM-dd'T'HH:mm",
        ),
        secondaryGuests: gridData.secondaryGuests || [],
      });
    }
  }, [isOpen, gridData, form]);
  // useEffect(() => {
  //   if (isOpen && gridData) {
  //     setMode("SELECTION");
  //     form.reset({
  //       roomId: gridData.roomId || "",
  //       guestName: "",
  //       phone: "",
  //       documentId: "",
  //       address: "",
  //       checkInDate: format(gridData.date, "yyyy-MM-dd'T'HH:mm"),
  //       checkOutDate: format(addDays(gridData.date, 1), "yyyy-MM-dd'T'HH:mm"),
  //       secondaryGuests: [],
  //     });
  //   }
  // }, [isOpen, gridData, form]);

  const handleSelectAction = (type: "BOOKING" | "CHECKIN") => {
    setActionType(type);
    setMode("FORM");
  };

  const onSubmit = (data: BookingValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Room Booking and Check-in Portal</DialogTitle>
        </DialogHeader>

        {/* HEADER SECTION */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {mode === "FORM" && (
                <ArrowLeft
                  className="cursor-pointer hover:text-indigo-400 transition-colors"
                  onClick={() => setMode("SELECTION")}
                />
              )}
              {gridData?.roomNumber || "N/A"}
            </h2>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">
              {mode === "SELECTION"
                ? "Select Operation Type"
                : `${actionType} Configuration`}
            </p>
          </div>
          {mode === "FORM" && (
            <Badge
              variant={actionType === "CHECKIN" ? "success" : "default"}
              className="bg-emerald-500 text-white border-none px-3 py-1"
            >
              {actionType === "CHECKIN" ? "LIVE CHECK-IN" : "RESERVATION"}
            </Badge>
          )}
        </div>

        {/* MODE 1: SELECTION */}
        {mode === "SELECTION" && (
          <div className="p-8 grid grid-cols-2 gap-6 bg-slate-50">
            <button
              onClick={() => handleSelectAction("BOOKING")}
              className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-600 transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <CalendarIcon size={32} />
              </div>
              <span className="font-bold text-slate-800">Reservation</span>
              <span className="text-xs text-slate-500 mt-1">
                Book for a future date
              </span>
            </button>

            <button
              onClick={() => handleSelectAction("CHECKIN")}
              className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-600 transition-all hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <LogIn size={32} />
              </div>
              <span className="font-bold text-slate-800">Quick Check-In</span>
              <span className="text-xs text-slate-500 mt-1">
                Direct walk-in entry
              </span>
            </button>
          </div>
        )}

        {/* MODE 2: THE FORM */}
        {mode === "FORM" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="overflow-y-auto max-h-[80vh]"
            >
              <div className="p-6 space-y-8">
                {/* Section 1: Primary Guest */}
                <div>
                  <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <User size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Primary Guest Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input
                              placeholder="Full Name"
                              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Phone
                                className="absolute left-3 top-3 text-slate-400"
                                size={16}
                              />
                              <Input
                                placeholder="Phone Number"
                                className="pl-10 h-11 bg-slate-50"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <CreditCard
                                className="absolute left-3 top-3 text-slate-400"
                                size={16}
                              />
                              <Input
                                placeholder="ID / Passport No."
                                className="pl-10 h-11 bg-slate-50"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <div className="relative">
                              <MapPin
                                className="absolute left-3 top-3 text-slate-400"
                                size={16}
                              />
                              <Input
                                placeholder="Guest Origin / address"
                                className="pl-10 h-11 bg-slate-50"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Section 2: Stay Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase">
                          Check-In
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="h-11 bg-slate-50"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase">
                          Check-Out
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="h-11 bg-slate-50"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />
                {/* Section: Financials (Advance Payment) */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <CreditCard size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      Advance Payment
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* CASH PORTION */}
                    <FormField
                      control={form.control}
                      name="cashAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase">
                            Cash Amount
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3 w-5 h-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                                ₹
                              </div>
                              <Input
                                type="number"
                                className="pl-10 h-11 bg-white border-slate-200 focus:ring-emerald-500"
                                placeholder="0.00"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* ONLINE PORTION */}
                    <FormField
                      control={form.control}
                      name="onlineAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase">
                            Online / UPI
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-3 w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                ₹
                              </div>
                              <Input
                                type="number"
                                className="pl-10 h-11 bg-white border-slate-200 focus:ring-blue-500"
                                placeholder="0.00"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dynamic Summary */}
                  <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Total Advance
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ₹
                      {(
                        Number(form.watch("cashAmount")) +
                        Number(form.watch("onlineAmount"))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Separator />
                {/* Section 3: Secondary Guests */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Users size={18} />
                      <h3 className="text-sm font-bold uppercase tracking-wider">
                        Secondary Guests
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", documentId: "" })}
                      className="text-xs h-8 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Plus size={14} className="mr-1" /> Add Guest
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex gap-3 p-3 bg-slate-50 rounded-lg items-end border border-slate-100"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Guest Name"
                            className="h-9 text-sm"
                            {...form.register(
                              `secondaryGuests.${index}.name` as const,
                            )}
                          />
                          <Input
                            placeholder="ID Number"
                            className="h-9 text-sm"
                            {...form.register(
                              `secondaryGuests.${index}.documentId` as const,
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-4 italic">
                        No secondary guests added
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-6 bg-slate-50 border-t flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`flex-[2] h-12 font-bold ${actionType === "CHECKIN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                  {mutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    `CONFIRM ${actionType}`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
