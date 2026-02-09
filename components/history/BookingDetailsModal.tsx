// components/history/BookingDetailsModal.tsx
import {
  X,
  Printer,
  Bed,
  Utensils,
  Calendar,
  Phone,
  Hash,
  History,
  Receipt,
} from "lucide-react";

export default function BookingDetailsModal({ booking, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Stay Archive
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID: {booking.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Guest & Room Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Guest Info
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase italic">
                  {booking.guestName[0]}
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase italic">
                    {booking.guestName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Phone size={10} /> {booking.guestPhone}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Allocated Room
              </h3>
              <div>
                <p className="text-2xl font-black italic text-slate-900">
                  {booking.room.roomNumber}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {booking.room.type}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Financial Breakdown */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Receipt size={12} /> Billing Summary
            </h3>
            <div className="bg-slate-50 rounded-[32px] p-6 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>
                  Room Charges ({new Date(booking.checkIn).toLocaleDateString()}{" "}
                  - {new Date(booking.checkOut).toLocaleDateString()})
                </span>
                <span className="text-slate-900">
                  ₹{booking.totalBill + booking.discount}
                </span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-xs font-bold text-red-500">
                  <span>Applied Discount</span>
                  <span>- ₹{booking.discount}</span>
                </div>
              )}
              <div className="h-px bg-slate-200 border-dashed my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase text-slate-900 italic">
                  Total Paid
                </span>
                <span className="text-3xl font-black italic text-emerald-600">
                  ₹{booking.totalBill}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <Printer size={16} /> Re-print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
