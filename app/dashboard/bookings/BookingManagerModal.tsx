"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { differenceInDays, format, startOfDay } from "date-fns";
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
  AlertCircle,
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
import { SimpleDateTimePicker } from "@/components/DateTimePicker";
import { DialogDescription } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

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
  miscCharges: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
});

type ManageValues = z.infer<typeof manageBookingSchema>;

export default function BookingManagerModal({
  isOpen,
  onClose,
  bookingId,
}: any) {
  const queryClient = useQueryClient();
  console.log("booking", bookingId);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: async () => {
      const res = await api.get(`/rooms/bookings/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId && isOpen, // Only fetch if we have an ID and modal is open
    staleTime: 0,
  });
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
      miscCharges: booking?.totalBill || 0, // Mapping to your DB field if applicable
      discount: booking?.discount || 0,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "secondaryGuests",
  });
  const watchedMisc = form.watch("miscCharges") || 0;
  const watchedDiscount = form.watch("discount") || 0;

  const confirmCheckInMutation = useMutation({
    mutationFn: (id: string) => {
      const currentFormData = form.getValues();
      // Use a new endpoint that handles both: Update + CheckIn
      return api.patch(
        `/rooms/bookings/${id}/update-and-checkin`,
        currentFormData,
      );
    },
    onSuccess: () => {
      toast.success("Details saved and Guest checked in!");
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "Failed to check in";
      toast.error(errorMessage);
    },
  });

  // const confirmCheckInMutation = useMutation({
  //   mutationFn: (id: string) =>
  //     api.patch(`/rooms/bookings/${id}/confirm-checkin`),
  //   onSuccess: () => {
  //     toast.success("Guest checked in successfully");
  //     queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
  //     queryClient.invalidateQueries({ queryKey: ["rooms"] });
  //     onClose();
  //   },
  //   onError: (err: any) => {
  //     const errorMessage = err.response?.data?.message || "Failed to check in";
  //     toast.error(errorMessage);
  //   },
  // });

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
  // Inside your Component
  const foodOrders = booking?.foodOrders || [];
  const servedUnpaidItems =
    booking?.foodOrders
      ?.filter((order: any) => order.status !== "PAID")
      .flatMap((order: any) =>
        order.items.filter((item: any) => item.status === "SERVED"),
      ) || [];
  // Calculate total for all pending orders
  const foodTotal = servedUnpaidItems.reduce((acc: number, item: any) => {
    return acc + Number(item.priceAtOrder) * item.quantity;
  }, 0);

  // Calculate Room Total (Simplified version of your logic)
  const nights =
    booking?.checkIn && booking?.checkOut
      ? Math.max(
          1,
          differenceInDays(
            startOfDay(new Date(booking.checkOut)),
            startOfDay(new Date(booking.checkIn)),
          ),
        )
      : 0;
  const roomTotal = nights * Number(booking?.room?.basePrice || 0);
  // const grandTotal = roomTotal + foodTotal;

  const subtotal = roomTotal + foodTotal + Number(watchedMisc);
  const grandTotal = Math.max(0, subtotal - Number(watchedDiscount));
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

  useEffect(() => {
    if (isOpen && bookingId) {
      refetch();
    }
  }, [isOpen, bookingId, refetch]);

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
    mutationFn: (paymentMode: string) =>
      api.post(`/rooms/bookings/${booking.id}/checkout`, {
        paymentMode,
        totalBill: grandTotal,
        discount: watchedDiscount,
        miscCharges: watchedMisc,
        // Pass these so your backend records the snapshot accurately
      }),
    onSuccess: () => {
      toast.success("Guest checked out successfully.");
      queryClient.invalidateQueries({ queryKey: ["room-timeline"] });
      setIsPaymentModalOpen(false); // Close payment modal
      onClose(); // Close management modal
    },
  });

  if (!booking) return null;
  const finalBillData = {
    bookingId: booking.id,
    roomTotal,
    foodTotal,
    miscCharges: Number(watchedMisc),
    discount: Number(watchedDiscount),
    subtotal,
    grandTotal,
  };
  const billSummary = {
    nights,
    roomTotal,
    foodTotal,
    servedItemsCount: servedUnpaidItems.length,
    miscCharges: Number(watchedMisc),
    discount: Number(watchedDiscount),
    grandTotal,
  };
  function PaymentSettlementModal({
    isOpen,
    onClose,
    billData,
    onConfirm,
    isPending,
  }: any) {
    const [paymentMode, setPaymentMode] = useState("CASH");

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
          {/* Header Section */}
          <div className="bg-slate-900 p-8 text-center text-white">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                <CheckCircle2 size={28} />
              </div>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Final Settlement
            </h2>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-medium">
              Ready for Payment
            </p>

            <div className="mt-6 py-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-black">
                Net Amount
              </span>
              <div className="text-4xl font-black text-white tracking-tighter">
                ₹{billData.grandTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">
                  Room Charges ({billData.nights}n)
                </span>
                <span className="font-bold text-slate-900">
                  ₹{billData.roomTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-medium">
                    Restaurant Services
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase">
                    {billData.servedItemsCount} Items Served
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{billData.foodTotal.toLocaleString()}
                </span>
              </div>

              {billData.miscCharges > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">
                    Miscellaneous
                  </span>
                  <span className="font-bold text-slate-900">
                    + ₹{billData.miscCharges.toLocaleString()}
                  </span>
                </div>
              )}

              {billData.discount > 0 && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                  <span className="text-orange-600 font-bold uppercase text-[10px]">
                    Discount Applied
                  </span>
                  <span className="font-bold text-orange-600">
                    - ₹{billData.discount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Toggle */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Payment Method
              </p>
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setPaymentMode("CASH")}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${paymentMode === "CASH" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                >
                  CASH
                </button>
                <button
                  onClick={() => setPaymentMode("ONLINE")}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${paymentMode === "ONLINE" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"}`}
                >
                  ONLINE / UPI
                </button>
              </div>
            </div>

            {/* Settlement Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1 h-12 rounded-xl font-bold text-slate-400"
                onClick={onClose}
              >
                Go Back
              </Button>
              <Button
                className="flex-[2] h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100"
                onClick={() => onConfirm(paymentMode)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Complete Transaction"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="bg-gray-100 p-6 text-slate-900 flex flex-row justify-between items-center space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4">
              {/* Visual Indicator Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <BedDouble size={20} />
              </div>

              <div className="flex items-center gap-3">
                <DialogTitle className="text-lg font-bold tracking-tight text-slate-900">
                  Booking Management
                </DialogTitle>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-2xl text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {booking.room?.roomNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
          {/* <Badge className="bg-emerald-500 text-white border-none uppercase text-[10px] px-3">
            {booking.status}
          </Badge> */}
        </DialogHeader>

        <div className="grid grid-cols-12 h-[700px] bg-white">
          {/* LEFT COLUMN: STAY & GUEST FORM */}
          <div className="col-span-7 flex flex-col h-[700px] border-r border-slate-100 bg-white">
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <Form {...form}>
                <form id="booking-form" className="space-y-8">
                  <section>
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
                  </section>

                  {/* <Separator className="opacity-50" /> */}

                  <section>
                    <div className="flex items-center gap-2 text-slate-900 mb-4">
                      <User size={18} />
                      <h3 className="text-xs font-black uppercase  ">
                        Guest Details
                      </h3>
                    </div>
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

                  <section className=" ">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {/* Additional Guests */}
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
                        <div
                          key={field.id}
                          className="flex gap-3 items-center bg-slate-50 p-4 py-2 rounded-xl"
                        >
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
              <section>
                <Dialog
                  open={isCancelModalOpen}
                  onOpenChange={setIsCancelModalOpen}
                >
                  <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                    {/* Screen Reader Only Titles for Accessibility */}
                    <DialogHeader className="sr-only">
                      <DialogTitle>Cancel Booking</DialogTitle>
                      <DialogDescription>
                        Enter a reason to cancel this room reservation.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-4 bg-red-50 text-red-500 rounded-full">
                          <AlertCircle size={32} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            Cancel Booking?
                          </h2>
                          <p className="text-sm text-slate-500">
                            This will release{" "}
                            <strong>Room {booking?.room?.roomNumber}</strong>{" "}
                            back to inventory.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Reason for Cancellation
                        </label>
                        <Input
                          placeholder="e.g. Guest No-Show, Duplicate Booking..."
                          className="h-12 bg-slate-50 border-none rounded-xl text-sm focus-visible:ring-red-500"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="ghost"
                          className="flex-1 h-12 rounded-xl font-bold text-slate-400"
                          onClick={() => setIsCancelModalOpen(false)}
                        >
                          Close
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-[2] h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100"
                          disabled={cancelMutation.isPending}
                          onClick={() => {
                            if (!cancelReason)
                              return toast.error("Please provide a reason");
                            cancelMutation.mutate(booking.id, { cancelReason });
                            setIsCancelModalOpen(false);
                          }}
                        >
                          {cancelMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Confirm Cancellation"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </section>
            </div>
            {booking?.id && (
              <div className="p-6 bg-slate-50 border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col gap-4">
                  {/* Top Row: Primary & Secondary Actions */}
                  <div className="flex gap-3 w-full">
                    {/* UPDATE ACTION - Secondary */}
                    <Button
                      variant="terminalGhost"
                      className="flex-1  "
                      onClick={() => updateMutation.mutate(form.getValues())}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} className="mr-2" />
                      )}
                      Update Details
                    </Button>

                    {/* CHECK-IN ACTION - Primary */}
                    <div className="flex-[1.2]">
                      {booking.status === "RESERVED" ? (
                        <Button
                          type="button"
                          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 rounded-xl active:scale-[0.98]"
                          onClick={() =>
                            confirmCheckInMutation.mutate(booking.id)
                          }
                          disabled={confirmCheckInMutation.isPending}
                        >
                          {confirmCheckInMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <div className="flex items-center justify-center">
                              <CheckCircle2 size={18} className="mr-2" />
                              Confirm Check-In
                            </div>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center h-12 w-full border border-slate-200 bg-slate-100/50 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest cursor-not-allowed">
                          <CheckCircle2 size={16} className="mr-2" />
                          Already Checked In
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Destructive Action (Isolated) */}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-200/50">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Cancel Reservation
                    </Button>

                    {/* Subtle helper text for Admin context */}
                    <p className="text-[10px] text-slate-400 font-medium italic italic">
                      * Ensure guest ID is verified before check-in.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <PaymentSettlementModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            billData={billSummary}
            isPending={checkoutMutation.isPending}
            onConfirm={(mode: string) => checkoutMutation.mutate(mode)}
          />
          {/* RIGHT COLUMN: RESTAURANT & BILLING */}

          <div className="col-span-5 bg-slate-50/80 p-0 flex flex-col border-l border-slate-200">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Room Charge Segment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <BedDouble size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Accommodation
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Room Stay :{" "}
                        <span className="text-bold text-gray-900">
                          {nights}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Rate: ₹{booking?.room?.basePrice}/night
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{roomTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service/Food Segment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShoppingBag size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Food Services
                  </span>
                </div>

                {/* 1. Filter orders: Only show orders that have at least one item with status "SERVED" */}
                {foodOrders.filter((order: any) =>
                  order.items.some((item: any) => item.status === "SERVED"),
                ).length > 0 ? (
                  <div className="space-y-2">
                    {foodOrders
                      .filter((order: any) =>
                        order.items.some(
                          (item: any) => item.status === "SERVED",
                        ),
                      )
                      .map((order: any) => (
                        <div
                          key={order.id}
                          className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                  #{order.orderNumber || order.id.slice(-4)}
                                </span>
                                {/* Optional: Add a timestamp or order date if available */}
                              </div>

                              <div className="mt-2 space-y-1">
                                {/* 2. Filter items: Only map through items that are "SERVED" */}
                                {order.items
                                  .filter(
                                    (item: any) => item.status === "SERVED",
                                  )
                                  .map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between text-xs text-slate-600"
                                    >
                                      <span>
                                        {item.menuItem.name}{" "}
                                        <span className="text-slate-400">
                                          × {item.quantity}
                                        </span>
                                      </span>
                                      <span className="font-medium text-slate-900">
                                        ₹
                                        {(
                                          item.priceAtOrder * item.quantity
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <ShoppingBag size={24} className="opacity-20 mb-2" />
                    <p className="text-[11px] font-medium italic">
                      No served food charges to display
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Misc. Charges
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      {...form.register("miscCharges")}
                      className="pl-7 h-10 bg-slate-50 border-none rounded-lg text-sm font-semibold focus-visible:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Discount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-orange-500 text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      {...form.register("discount")}
                      className="pl-7 h-10 bg-orange-50/50 border-none rounded-lg text-sm font-semibold text-orange-700 focus-visible:ring-orange-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Financial Footer */}
            <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-700">
                    ₹{(roomTotal + foodTotal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Taxes & Fees (0%)</span>
                  <span className="text-slate-700">₹0.00</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-xs font-black text-slate-900 uppercase">
                    Total Balance Due
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {/* ₹{grandTotal.toLocaleString()} */}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                  // onClick={() => checkoutMutation.mutate()}
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={checkoutMutation.isPending}
                >
                  <CreditCard size={18} />
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  onClick={() => updateMutation.mutate(form.getValues())}
                >
                  <Save size={18} className="mr-2" />
                  Update Folio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
