"use client";
import { X, Printer, Receipt, Calendar, User, Hash } from "lucide-react";

interface BillReceiptModalProps {
  order: any;
  onClose: () => void;
}

export default function BillReceiptModal({
  order,
  onClose,
}: BillReceiptModalProps) {
  if (!order) return null;

  const isSplit = order.paymentMode === "SPLIT";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Bill Receipt
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Transaction Ref: {order.id.split("-")[0]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* RECEIPT CONTENT */}
        <div className="p-8 overflow-y-auto space-y-8">
          {/* META INFO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Table / Room
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Hash size={14} className="text-slate-400" />{" "}
                {order.table?.number || "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Date & Time
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Calendar size={14} className="text-slate-400" />
                {new Date(order.updatedAt).toLocaleDateString()} at{" "}
                {new Date(order.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Order Summary
            </span>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                      {item.menuItem.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      ₹{item.priceAtOrder} × {item.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    ₹{item.priceAtOrder * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOTALS & TAXES */}
          <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Subtotal</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Service Charge (0%)</span>
              <span>₹0.00</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900 uppercase">
                Grand Total
              </span>
              <span className="text-xl font-black text-slate-900">
                ₹{Number(order.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* PAYMENT BREAKDOWN (Handling Split Payments) */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Payment Details
            </span>
            <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Primary Method
              </span>
              <span
                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${order.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
              >
                {order.paymentMode || "PENDING"}
              </span>
            </div>

            {isSplit && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Cash Amount
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    ₹{order.amountCash}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Online/UPI
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    ₹{order.amountOnline}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            <Printer size={16} /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
