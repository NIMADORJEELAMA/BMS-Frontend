"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  X,
  Printer,
  Loader2,
  CheckCircle,
  Bed,
  Utensils,
  Percent,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CheckOutSummary({ bookingId, onClose }: any) {
  const queryClient = useQueryClient();
  const [discount, setDiscount] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["checkout-preview", bookingId],
    queryFn: async () =>
      (await api.get(`/rooms/bookings/${bookingId}/summary`)).data,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () =>
      await api.post(`/rooms/check-out/${bookingId}`, { discount }),
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

  const subtotal = data.breakdown.grandTotal;
  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-white/20">
        {/* HEADER SECTION */}
        <div className="p-10 bg-slate-900 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Checkout Session
              </span>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              {data.room.roomNumber}
            </h2>
            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest italic">
              Guest: {data.guestName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[60vh] overflow-y-auto">
          {/* LEFT: ROOM DETAILS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Bed size={18} />
              </div>
              <h3 className="font-black uppercase text-xs tracking-widest">
                Stay Summary
              </h3>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Rate
                </span>
                <span className="text-sm font-black text-slate-900 italic">
                  ₹{data.breakdown.roomPrice} / Night
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Nights
                </span>
                <span className="text-sm font-black text-slate-900 italic">
                  {data.breakdown.nights}
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-black text-slate-900 uppercase">
                  Room Total
                </span>
                <span className="text-xl font-black text-slate-900 italic">
                  ₹{data.breakdown.roomTotal}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: ROOM SERVICE DETAILS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Utensils size={18} />
              </div>
              <h3 className="font-black uppercase text-xs tracking-widest">
                Service Details
              </h3>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 space-y-4">
              <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {data.breakdown.foodDetails.length > 0 ? (
                  data.breakdown.foodDetails.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between text-[11px] font-bold"
                    >
                      <span className="text-slate-500 uppercase">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-slate-900 italic">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic font-medium py-4 text-center">
                    No service orders found
                  </p>
                )}
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-black text-slate-900 uppercase">
                  Service Total
                </span>
                <span className="text-xl font-black text-slate-900 italic">
                  ₹{data.breakdown.foodTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER: TOTAL & DISCOUNT */}
        <div className="p-10 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
            <div className="w-full md:w-64 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1">
                <Percent size={10} /> Apply Discount (₹)
              </label>
              <input
                type="number"
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-black italic focus:border-slate-900 transition-all outline-none"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter line-through">
                Subtotal: ₹{subtotal}
              </p>
              <div className="flex items-center gap-4 justify-end">
                <span className="text-sm font-black uppercase text-slate-900 italic">
                  Final Amount
                </span>
                <span className="text-5xl font-black italic tracking-tighter text-emerald-600">
                  ₹{grandTotal}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => window.print()}
              className="py-5 rounded-3xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              <Printer size={16} /> Print Bill
            </button>
            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <CheckCircle size={16} /> Complete Checkout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
