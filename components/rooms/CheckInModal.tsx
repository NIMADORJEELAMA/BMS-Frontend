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
  Banknote,
  Globe,
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

import {
  EnterpriseDateTimePicker,
  SimpleDateTimePicker,
} from "../DateTimePicker";

const bookingSchema = z.object({
  roomId: z.string().min(1),
  guestName: z.string().min(2, "Primary guest name is required"),
  guestPhone: z.string().min(10, "Valid guestPhone number required"),
  documentId: z.string().min(1, "Document ID is required"),
  address: z.string().min(2, "City/address is required"),
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  // Financials
  cashAmount: z.coerce.number().min(0).default(0),
  onlineAmount: z.coerce.number().min(0).default(0),
  advanceAmount: z.coerce.number().min(0).default(0),

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

export default function CheckInModal({ isOpen, onClose, gridData }: any) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"SELECTION" | "FORM">("SELECTION");
  const [actionType, setActionType] = useState<"BOOKING" | "CHECKIN">(
    "BOOKING",
  );
  console.log("mode, actionType", mode, actionType);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: "",
      guestName: "",
      guestPhone: "",
      documentId: "",
      address: "",
      checkInDate: "",
      checkOutDate: "",
      secondaryGuests: [],
      cashAmount: 0,
      onlineAmount: 0,
      advanceAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "secondaryGuests",
  });

  // Calculate Total Advance on the fly
  const cashPortion = form.watch("cashAmount") || 0;
  const onlinePortion = form.watch("onlineAmount") || 0;
  const totalAdvance = Number(cashPortion) + Number(onlinePortion);

  const mutation = useMutation({
    mutationFn: (data: BookingValues) => api.post("/rooms/check-in", data),

    onSuccess: () => {
      toast.success("Transaction recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Check-in failed"),
  });
  useEffect(() => {
    if (isOpen && gridData) {
      setMode("SELECTION");
      let checkIn = gridData.date ? new Date(gridData.date) : new Date();

      // 2. Get the current actual time (e.g., 1:06 PM)
      const now = new Date();

      // 3. Inject CURRENT time into the SELECTED date
      // This keeps the date as March 3rd but sets time to Now
      checkIn.setHours(now.getHours());
      checkIn.setMinutes(now.getMinutes());
      checkIn.setSeconds(0, 0);

      // 4. Create Check-Out date (Next Day)
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 1);

      // 5. Force Check-Out to exactly 11:00 AM
      checkOut.setHours(11, 0, 0, 0);

      form.reset({
        roomId: gridData.roomId || "",
        guestName: gridData.guestName || "",
        guestPhone: gridData.guestPhone || "",
        documentId: gridData.documentId || "",
        address: gridData.address || "",
        cashAmount: gridData.cashAmount || 0,
        onlineAmount: gridData.onlineAmount || 0,

        checkInDate: format(checkIn, "yyyy-MM-dd'T'HH:mm"),
        checkOutDate: format(checkOut, "yyyy-MM-dd'T'HH:mm"),

        secondaryGuests: gridData.secondaryGuests || [],
      });
    }
  }, [isOpen, gridData, form]); // Added actionType to dependencies
  // useEffect(() => {
  //   if (isOpen && gridData) {
  //     const baseDate = gridData.date ? new Date(gridData.date) : new Date();
  //     const now = new Date();
  //     const isToday = baseDate.toDateString() === now.toDateString();
  //     const initialCheckIn = isToday ? now : baseDate;
  //     initialCheckIn.setSeconds(0, 0);

  //     setMode(gridData.id ? "FORM" : "SELECTION");

  //     form.reset({
  //       roomId: gridData.roomId || "",
  //       guestName: gridData.guestName || "",
  //       guestPhone: gridData.guestPhone || "",
  //       documentId: gridData.documentId || "",
  //       address: gridData.address || "",
  //       cashAmount: gridData.cashAmount || 0,
  //       onlineAmount: gridData.onlineAmount || 0,
  //       advanceAmount: gridData.advanceAmount || 0,

  //       checkInDate: format(initialCheckIn, "yyyy-MM-dd'T'HH:mm"),
  //       checkOutDate: format(addDays(initialCheckIn, 1), "yyyy-MM-dd'T'HH:mm"),
  //       secondaryGuests: gridData.secondaryGuests || [],
  //     });
  //   }
  // }, [isOpen, gridData, form]);
  const onSubmit = (data: BookingValues) => {
    // Calculate total for the API body
    const totalAdvance =
      Number(data.cashAmount || 0) + Number(data.onlineAmount || 0);

    // Spread existing data and overwrite/add advanceAmount
    const payload = {
      ...data,
      advanceAmount: totalAdvance,
      type: actionType,
    };

    console.log("Sending to API:", payload);
    mutation.mutate(payload);
  };
  const handleSelectAction = (type: "BOOKING" | "CHECKIN") => {
    setActionType(type);
    setMode("FORM");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Stay Management Portal</DialogTitle>
        </DialogHeader>

        {/* HEADER SECTION */}
        <div className="bg-gray-100 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            {mode === "FORM" && !gridData?.id && (
              <Button
                variant="ghost"
                size="icon"
                className="text-black hover:bg-white"
                onClick={() => setMode("SELECTION")}
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {gridData?.roomNumber || gridData?.room?.roomNumber || "N/A"}
              </h2>
              <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest mt-0.5">
                {gridData?.id ? "Manage Stay" : "New Registration"}
              </p>
            </div>
          </div>
          {mode === "FORM" && (
            <Badge
              className={cn(
                "px-4 py-1 border-none flex flex-end mt-6",
                actionType === "CHECKIN" ? "bg-emerald-500" : "bg-indigo-500",
              )}
            >
              {actionType === "CHECKIN" ? "LIVE ENTRY" : "FUTURE BOOKING"}
            </Badge>
          )}
        </div>

        {mode === "SELECTION" ? (
          <div className="p-10 grid grid-cols-2 gap-6 bg-slate-100">
            <button
              onClick={() => handleSelectAction("BOOKING")}
              className="group p-10 bg-white border-2 rounded-[2rem] hover:border-indigo-600 transition-all shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
            >
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <CalendarIcon size={32} />
              </div>
              <span className="font-black text-slate-800 uppercase tracking-widest text-xs">
                Reservation
              </span>
            </button>
            <button
              onClick={() => handleSelectAction("CHECKIN")}
              className="group p-10 bg-white border-2 rounded-[2rem] hover:border-emerald-600 transition-all shadow-sm hover:shadow-xl flex flex-col items-center gap-4"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <LogIn size={32} />
              </div>
              <span className="font-black text-slate-800 uppercase tracking-widest text-xs">
                Direct Check-In
              </span>
            </button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 space-y-6">
                {/* SECTION 2: STAY DATES   */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-2    
                   rounded-xl      "
                >
                  <FormField
                    control={form.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <SimpleDateTimePicker
                            label="Arrival Date & Time"
                            value={field.value}
                            onChange={field.onChange}
                            required
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold mt-1.5 ml-2" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <SimpleDateTimePicker
                            label="Departure Date & Time"
                            value={field.value}
                            onChange={field.onChange}
                            required
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold mt-1.5 ml-2" />
                      </FormItem>
                    )}
                  />
                </div>
                {/* SECTION 1: GUEST DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-900">
                    <User size={18} />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                      Guest Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase ml-1 mb-0.5">
                            Full Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter guest's full name"
                              className="h-12 bg-slate-100 border-none rounded-l"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase ml-1 mb-0.5">
                            Phone Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Phone Number"
                                className=" h-12 bg-slate-100 border-none rounded-l"
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
                          <FormLabel className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase ml-1 mb-0.5">
                            Document ID <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Aadhar / Passport"
                                className=" h-12 bg-slate-100 border-none rounded-l"
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
                          <FormLabel className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase ml-1 mb-0.5">
                            Address <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Permanent Address"
                                className=" h-12 bg-slate-100 border-none rounded-l"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* SECTION 3: SECONDARY GUESTS */}
                <div className=" ">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-900 ">
                      {/* <Users size={18} />
                      <h5 className="text-xs font-black uppercase  ">
                        Companion Details
                      </h5> */}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", documentId: "" })}
                      className="h-6   "
                    >
                      <Plus size={14} className="mr-1" /> ADD GUEST
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex gap-3 p-4 bg-slate-100 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Guest Name"
                            className="h-10 bg-white rounded-lg border-slate-200 shadow-sm"
                            {...form.register(
                              `secondaryGuests.${index}.name` as const,
                            )}
                          />
                          <Input
                            placeholder="ID Number"
                            className="h-10 bg-white rounded-lg border-slate-200 shadow-sm"
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
                          className="text-red-400 hover:text-red-600 self-center hover:bg-red-50 rounded-full h-10 w-10"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    ))}
                    {/* {fields.length === 0 && (
                      <p className="text-center text-[10px] text-slate-400 py-6 uppercase tracking-widest font-bold">
                        No companions registered
                      </p>
                    )} */}
                  </div>
                </div>

                {/* Advance section */}
                <div className="space-y-2">
                  {/* Section Title */}
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <Banknote size={16} className="text-slate-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Advance Payment
                    </h3>
                  </div>

                  {/* Content Box */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-slate-200">
                      {/* Cash Input */}
                      <div className="p-4 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">
                          Cash Amount
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                            ₹
                          </div>
                          <Input
                            type="text"
                            className="pl-7 bg-white h-10 border-slate-200 rounded-lg text-sm font-semibold focus-visible:ring-1 focus-visible:ring-slate-950"
                            placeholder="0"
                            {...form.register("cashAmount")}
                          />
                        </div>
                      </div>

                      {/* Online Input */}
                      <div className="p-4 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">
                          Online / UPI
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                            ₹
                          </div>
                          <Input
                            type="text"
                            className="pl-7 bg-white h-10 border-slate-200 rounded-lg text-sm font-semibold focus-visible:ring-1 focus-visible:ring-slate-950"
                            placeholder="0"
                            {...form.register("onlineAmount")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total Summary Row */}
                    <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        Total Advance
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400">
                          ₹
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                          {totalAdvance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-6 bg-slate-100 border-t flex gap-4">
                <Button
                  type="button"
                  variant="terminalGhost"
                  onClick={onClose}
                  className="flex-2"
                  // className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  variant={"default"}
                  className="flex-8"

                  // className={cn(
                  //   "flex-[2] h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all",
                  //   actionType === "CHECKIN"
                  //     ? "bg-emerald-600 hover:bg-emerald-700"
                  //     : "bg-indigo-600 hover:bg-indigo-700",
                  // )}
                >
                  {mutation.isPending ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    `Process ${actionType}`
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
