"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  ShoppingBag,
  BedDouble,
  Save,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  CreditCard,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../../lib/axios";

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
import DatePicker from "@/components/DateRangePicker";

const manageBookingSchema = z.object({
  guestName: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  documentId: z.string().min(1, "ID required"),
  address: z.string().min(2, "Address required"),
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  secondaryGuests: z
    .array(
      z.object({
        name: z.string().min(2, "Name required"),
        documentId: z.string().min(1, "ID required"),
      }),
    )
    .optional(),
});

type ManageValues = z.infer<typeof manageBookingSchema>;

export default function BookingManagerModal({
  isOpen,
  onClose,
  bookingId,
}: any) {
  const queryClient = useQueryClient();
  console.log("booking", bookingId);
  const form = useForm<ManageValues>({
    resolver: zodResolver(manageBookingSchema),
    defaultValues: {
      guestName: "",
      phone: "",
      documentId: "",
      address: "",
      checkInDate: "",
      checkOutDate: "",
      secondaryGuests: [],
    },
  });
  const [cancelReason, setCancelReason] = useState("");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "secondaryGuests",
  });

  const {
    data: booking,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: async () => {
      const res = await api.get(`/rooms/bookings/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId && isOpen, // Only fetch if we have an ID and modal is open
  });

  const confirmCheckInMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/rooms/bookings/${id}/confirm-checkin`),
    onSuccess: () => {
      toast.success("Guest checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "Failed to check in";
      toast.error(errorMessage);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/rooms/bookings/${id}/cancel`),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "Cancellation failed";
      toast.error(errorMessage);
    },
  });

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this booking? This will release the room immediately.",
      )
    ) {
      cancelMutation.mutate(booking.id);
    }
  };
  useEffect(() => {
    if (booking) {
      form.reset({
        guestName: booking.guestName,
        phone: booking.guestPhone || "",
        documentId: booking.documentId || "",
        address: booking.address || "",
        checkInDate: format(new Date(booking.checkIn), "yyyy-MM-dd'T'HH:mm"),
        checkOutDate: format(new Date(booking.checkOut), "yyyy-MM-dd'T'HH:mm"),
        secondaryGuests: booking.secondaryGuests || [],
      });
    }
  }, [booking, form]);
  //   // Sync data when booking opens
  //   useEffect(() => {
  //     if (isOpen && booking) {
  //       form.reset({
  //         guestName: booking.guestName || "",
  //         phone: booking.guestPhone || "",
  //         documentId: booking.documentId || "",
  //         address: booking.address || "",
  //         checkInDate: booking.checkIn
  //           ? format(new Date(booking.checkIn), "yyyy-MM-dd'T'HH:mm")
  //           : "",
  //         checkOutDate: booking.checkOut
  //           ? format(new Date(booking.checkOut), "yyyy-MM-dd'T'HH:mm")
  //           : "",
  //         secondaryGuests: booking.secondaryGuests || [],
  //       });
  //     }
  //   }, [isOpen, booking, form]);

  const updateMutation = useMutation({
    mutationFn: (data: ManageValues) =>
      api.patch(`/rooms/bookings/${booking.id}`, data),
    onSuccess: () => {
      // This forces the Gantt Chart to refetch from the server
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });

      // Also invalidate the specific details for this booking
      queryClient.invalidateQueries({
        queryKey: ["booking-details", booking.id],
      });
      toast.success("Stay details updated");

      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "Update failed";
      toast.error(errorMessage);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => api.post(`/rooms/bookings/${booking.id}/checkout`),
    onSuccess: () => {
      toast.success("Guest checked out. Room is now available.");
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
      onClose();
    },
  });

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="bg-slate-900 p-6 text-white flex flex-row justify-between items-center space-y-0">
          <div className="flex items-center gap-3">
            <BedDouble size={20} />
            <div className="p-2 bg-indigo-500 rounded-lg"></div>
            <div>
              <DialogTitle className="text-xl">
                Manage Room {booking.room?.roomNumber}
              </DialogTitle>
              <p className="text-xs text-slate-400 font-medium">
                Guest: {booking.guestName}
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white border-none uppercase text-[10px] px-3">
            {booking.status}
          </Badge>
        </DialogHeader>

        <div className="grid grid-cols-12 h-[650px] bg-white">
          {/* LEFT COLUMN: STAY & GUEST FORM */}
          <div className="col-span-7 p-8 overflow-y-auto border-r border-slate-100">
            <Form {...form}>
              <form className="space-y-8">
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-6">
                    Stay Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="checkInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-slate-400 uppercase">
                            Arrival Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-12 bg-slate-50 border-none rounded-xl"
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
                          <FormLabel className="text-[10px] font-bold text-slate-400 uppercase">
                            Departure Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="h-12 bg-slate-50 border-none rounded-xl"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <Separator className="opacity-50" />

                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-6">
                    Primary Guest Identity
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <div className="relative">
                              <User
                                className="absolute left-4 top-3.5 text-slate-400"
                                size={18}
                              />
                              <Input
                                placeholder="Full Name"
                                className="pl-12 h-12 bg-slate-50 border-none rounded-xl"
                                {...field}
                              />
                            </div>
                          </FormControl>
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
                                className="absolute left-4 top-3.5 text-slate-400"
                                size={18}
                              />
                              <Input
                                placeholder="Phone Number"
                                className="pl-12 h-12 bg-slate-50 border-none rounded-xl"
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
                                className="absolute left-4 top-3.5 text-slate-400"
                                size={18}
                              />
                              <Input
                                placeholder="Document ID"
                                className="pl-12 h-12 bg-slate-50 border-none rounded-xl"
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
                                className="absolute left-4 top-3.5 text-slate-400"
                                size={18}
                              />
                              <Input
                                placeholder="Full Address"
                                className="pl-12 h-12 bg-slate-50 border-none rounded-xl"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Additional Guests
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", documentId: "" })}
                      className="h-7 text-[10px] font-bold"
                    >
                      <Plus size={14} className="mr-1" /> ADD GUEST
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-center">
                        <Input
                          placeholder="Name"
                          className="h-10 bg-white"
                          {...form.register(
                            `secondaryGuests.${index}.name` as const,
                          )}
                        />
                        <Input
                          placeholder="ID No"
                          className="h-10 bg-white"
                          {...form.register(
                            `secondaryGuests.${index}.documentId` as const,
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </form>
            </Form>
            {/* NEW: Reservation to Check-in Banner */}
            {booking?.status === "RESERVED" && (
              <div className="mx-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-emerald-800 font-bold text-sm">
                    Convert Reservation
                  </p>
                  <p className="text-emerald-600 text-[10px] uppercase font-black">
                    Guest has arrived at the property
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => confirmCheckInMutation.mutate(booking.id)}
                  disabled={confirmCheckInMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 font-bold text-xs"
                >
                  {confirmCheckInMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "CHECK-IN NOW"
                  )}
                </Button>
              </div>
            )}

            {booking?.id && (
              <div className="mt-10 p-6 border-2 border-dashed border-red-100 rounded-[2rem] bg-red-50/30 space-y-4">
                <div>
                  <h3 className="text-red-800 font-bold text-sm">
                    Cancel Management
                  </h3>
                  <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">
                    Provide a reason to void this stay
                  </p>
                </div>

                <div className="flex gap-3">
                  <Input
                    placeholder="Reason (e.g. Guest No-Show, Duplicate)"
                    className="bg-white border-red-100 focus-visible:ring-red-200"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (!cancelReason)
                        return toast.error("Please provide a reason");
                      cancelMutation.mutate(booking.id, {
                        cancelReason: cancelReason,
                      });
                    }}
                    disabled={cancelMutation.isPending}
                    className="bg-red-500 hover:bg-red-600 rounded-xl px-6 font-bold text-xs"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "CONFIRM CANCEL"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RESTAURANT & BILLING */}
          <div className="col-span-5 bg-slate-50/50 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-orange-600">
                <ShoppingBag size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">
                  Billing Summary
                </h3>
              </div>
              <Badge className="bg-orange-100 text-orange-700 border-none">
                UNPAID ORDERS
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {/* This will eventually be mapped from your actual API orders */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">
                      Restaurant Order #452
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Chicken Biryani, Soft Drink
                    </p>
                  </div>
                  <span className="font-black text-slate-900">₹540.00</span>
                </div>
              </div>

              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag size={32} className="opacity-20 mb-2" />
                <p className="text-xs italic">
                  No other pending service charges
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  <span>Room Charges</span>
                  <span className="text-slate-900">₹2,500.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  <span>Service/Food Total</span>
                  <span className="text-slate-900">₹540.00</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end pt-2">
                  <span className="text-sm font-black text-slate-900 uppercase">
                    Net Payable
                  </span>
                  <span className="text-3xl font-black text-indigo-600">
                    ₹3,040.00
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={form.handleSubmit((data) =>
                    updateMutation.mutate(data),
                  )}
                  disabled={updateMutation.isPending}
                  className="h-14 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} className="mr-2" /> UPDATE STAY
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="h-14 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-lg shadow-emerald-200"
                >
                  {checkoutMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="mr-2" /> CHECKOUT
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-slate-400 hover:text-slate-600"
              >
                CANCEL & RETURN
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
