"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  X,
  Printer,
  Loader2,
  CheckCircle,
  BedDouble,
  Utensils,
  Percent,
  Wallet,
  Globe,
  Receipt,
  History,
  Phone,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CheckOutSummary({ bookingId, onClose }: any) {
  const queryClient = useQueryClient();
  const [discount, setDiscount] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["checkout-preview", bookingId],
    queryFn: async () =>
      (await api.get(`/rooms/bookings/${bookingId}/summary`)).data,
  });

  // Totals Calculation
  const subtotal = data?.breakdown?.grandTotal || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const totalEntered = Number(cashAmount) + Number(onlineAmount);
  const isPaymentValid = Math.abs(totalEntered - grandTotal) < 0.01;

  // Auto-fill cash on load
  useEffect(() => {
    if (data && cashAmount === 0 && onlineAmount === 0) {
      setCashAmount(subtotal - discount);
    }
  }, [data, subtotal, discount]);

  const checkoutMutation = useMutation({
    mutationFn: async () =>
      await api.post(`/rooms/check-out/${bookingId}`, {
        discount,
        cashAmount,
        onlineAmount,
      }),
    onSuccess: () => {
      toast.success("Guest Checked Out Successfully");
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
  });

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20">
        {/* --- TOP: GUEST DETAILS --- */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl uppercase italic border border-white/10">
              {data.guestName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                {data.guestName}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                  <Phone size={10} /> {data.guestPhone || "No Phone"}
                </p>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                  <History size={10} /> Session ID: {bookingId.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- MIDDLE: SIDE-BY-SIDE SPLIT --- */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 h-[45vh]">
          {/* LEFT: ROOM DETAILS */}
          <div className="p-8 overflow-y-auto bg-slate-50/30">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BedDouble size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                Stay Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-4xl font-black italic text-slate-900">
                  {data.room.roomNumber}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                  {data.room.type}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Rate/Night
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    ₹{data.breakdown.roomPrice}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Duration
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {data.breakdown.nights} Nights
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Room Charges
                </span>
                <span className="font-black text-slate-900 text-lg">
                  ₹{data.breakdown.roomTotal}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: FOOD DETAILS */}
          <div className="p-8 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Utensils size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                Dining & Services
              </h3>
            </div>
            <div className="space-y-3">
              {data.breakdown.foodDetails.length > 0 ? (
                data.breakdown.foodDetails.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0"
                  >
                    <p className="text-xs text-slate-700 font-medium italic capitalize">
                      <span className="font-black text-slate-900 mr-2 not-italic">
                        x{item.quantity}
                      </span>
                      {item.name.toLowerCase()}
                    </p>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-3xl">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    No service orders
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- BOTTOM: SETTLEMENT ZONE --- */}
        <div className="p-8 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Discount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                Discount (₹)
              </label>
              <div className="relative">
                <Percent
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="number"
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-black italic outline-none focus:border-slate-900"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Cash */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-emerald-600 ml-1">
                Cash Payment (₹)
              </label>
              <div className="relative">
                <Wallet
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
                  size={14}
                />
                <input
                  type="number"
                  className="w-full bg-white border-2 border-emerald-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-black italic outline-none focus:border-emerald-500 text-emerald-700"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Online */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-600 ml-1">
                Online Payment (₹)
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
                  size={14}
                />
                <input
                  type="number"
                  className="w-full bg-white border-2 border-blue-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-black italic outline-none focus:border-blue-500 text-blue-700"
                  value={onlineAmount}
                  onChange={(e) => setOnlineAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Total Indicator */}
            <div
              className={`p-4 rounded-2xl border-2 flex flex-col justify-center ${isPaymentValid ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-rose-200 text-rose-500 animate-pulse"}`}
            >
              <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-80">
                Final Payable
              </p>
              <p className="text-2xl font-black italic tracking-tighter leading-none">
                ₹{grandTotal}
              </p>
              {!isPaymentValid && (
                <p className="text-[8px] font-black uppercase mt-1">
                  Pending: ₹{Math.abs(grandTotal - totalEntered).toFixed(0)}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={18} /> Print Draft
            </button>
            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending || !isPaymentValid}
              className={`flex-[2] py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl
                ${
                  isPaymentValid
                    ? "bg-slate-900 text-white hover:bg-emerald-600 active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <CheckCircle size={18} /> Complete Checkout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
