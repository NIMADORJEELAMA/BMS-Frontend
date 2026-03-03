// components/history/BookingDetailsModal.tsx
import {
  X,
  Printer,
  Download,
  Utensils,
  Phone,
  BedDouble,
  Calendar,
  Receipt,
  Hash,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingDetailsModal({ booking, onClose }: any) {
  const foodTotal =
    booking.orders?.reduce(
      (acc: number, order: any) => acc + Number(order.totalAmount),
      0,
    ) || 0;

  const roomCharges = booking.totalBill + booking.discount - foodTotal;

  // Handle CSV Export
  const exportToCSV = () => {
    const data = [
      ["Category", "Description", "Amount"],
      [
        "Stay",
        `${booking.room.roomNumber} - ${booking.room.type}`,
        roomCharges,
      ],
      ["Food", "Dining & Services", foodTotal],
      ["Discount", "Applied Discount", booking.discount],
      ["Total", "Grand Total", booking.totalBill],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoice_${booking.id.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200">
        {/* ACTION HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 gap-2"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 gap-2"
              onClick={exportToCSV}
            >
              <Download size={14} /> Export
            </Button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* RECEIPT CONTENT */}
        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto print:p-0">
          {/* BRANDING & GUEST INFO */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-slate-900 text-white rounded-2xl mb-2">
              <Receipt size={24} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900">
              Guest Folio
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Official Receipt
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-y border-dashed border-slate-200 py-6">
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Guest
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {booking.guestName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {booking.guestPhone}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Reference
                </p>
                <p className="text-[11px] font-mono text-slate-600">
                  #{booking.id.toUpperCase().slice(0, 12)}
                </p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Room
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {booking.room.roomNumber}
                </p>
                <p className="text-[11px] text-slate-500 uppercase">
                  {booking.room.type}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                  {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMIZATION TABLE */}
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <span>Description</span>
              <span>Amount</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <BedDouble size={14} />
                  </div>
                  <span className="font-medium text-slate-700">
                    Room Accommodation
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{roomCharges.toLocaleString()}
                </span>
              </div>

              {foodTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Utensils size={14} />
                    </div>
                    <span className="font-medium text-slate-700">
                      Dining & Room Service
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{foodTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {booking.discount > 0 && (
                <div className="flex justify-between items-center text-sm px-1 py-1 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-700 font-bold text-[11px] px-2 uppercase tracking-tight">
                    Special Discount
                  </span>
                  <span className="font-bold text-emerald-700 pr-2">
                    - ₹{booking.discount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FINAL TOTAL */}
          <div className="pt-6 border-t-2 border-slate-900">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Settled
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">
                    Paid
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    via Card/Cash
                  </span>
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                ₹{booking.totalBill.toLocaleString()}
              </p>
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div className="text-center pt-4">
            <p className="text-[10px] text-slate-400 font-medium italic">
              Thank you for staying at Gairigaon Hill Top Resort.
            </p>
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Settled & Verified
          </p>
        </div>
      </div>
    </div>
  );
}
