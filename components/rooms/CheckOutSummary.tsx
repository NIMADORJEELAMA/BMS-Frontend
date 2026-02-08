// components/rooms/CheckOutSummary.tsx
"use client";
import { Receipt, X, Printer } from "lucide-react";

export default function CheckOutSummary({ data, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            Final Bill
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="border-b border-dashed border-slate-200 pb-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>
                Room {data.room.roomNumber} ({data.breakdown.nights} Nights)
              </span>
              <span>₹{data.breakdown.roomTotal}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Food & Room Service</span>
              <span>₹{data.breakdown.foodTotal}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-black uppercase text-slate-900">
              Grand Total
            </span>
            <span className="text-2xl font-black italic text-slate-900">
              ₹{data.breakdown.grandTotal}
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Printer size={16} /> Print Invoice & Close
          </button>
        </div>
      </div>
    </div>
  );
}
