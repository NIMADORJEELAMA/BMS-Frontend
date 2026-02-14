// components/history/BookingDetailsModal.tsx
import {
  X,
  Printer,
  Utensils,
  Phone,
  History,
  Receipt,
  BedDouble,
  Clock,
} from "lucide-react";

export default function BookingDetailsModal({ booking, onClose }: any) {
  const foodTotal =
    booking.orders?.reduce(
      (acc: number, order: any) => acc + Number(order.totalAmount),
      0,
    ) || 0;
  const roomCharges = booking.totalBill + booking.discount - foodTotal;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20">
        {/* --- TOP SECTION: GUEST IDENTITY --- */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-white text-xl uppercase   border border-white/10">
              {booking.guestName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black   uppercase tracking-tighter">
                  {booking.guestName}
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-black uppercase">
                  Verified Stay
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                  <Phone size={10} /> {booking.guestPhone}
                </p>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                  <History size={10} /> Ref: {booking.id.slice(0, 8)}
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

        {/* --- MIDDLE SECTION: SIDE-BY-SIDE GRID --- */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 h-[50vh]">
          {/* LEFT COLUMN: ROOM DETAILS */}
          <div className="p-8 overflow-y-auto bg-slate-50/30">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BedDouble size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                Stay Details
              </h3>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-4xl font-black   text-slate-900">
                  {booking.room.roomNumber}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                  {booking.room.type} CATEGORY
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Check In
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Check Out
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {new Date(booking.checkOut).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Room Base Price
                </span>
                <span className="font-black text-slate-900 text-lg">
                  ₹{roomCharges}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FOOD & ORDERS */}
          <div className="p-8 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Utensils size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                Dining & Services
              </h3>
            </div>

            {booking.orders && booking.orders.length > 0 ? (
              <div className="space-y-4">
                {booking.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-b border-slate-100">
                      <span className="text-[9px] font-black text-slate-500 uppercase  ">
                        Ticket #{order.id.slice(0, 5)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock size={10} />{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      {order.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <p className="text-xs text-slate-700 font-medium   capitalize">
                            <span className="font-black text-slate-900 mr-2 not- ">
                              x{item.quantity}
                            </span>
                            {item.menuItem.name.toLowerCase()}
                          </p>
                          <span className="text-xs font-bold text-slate-900">
                            ₹{item.priceAtOrder * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px]">
                <Utensils size={24} className="text-slate-200 mb-2" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  No Dining Records
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- BOTTOM SECTION: TOTALS & ACTIONS --- */}
        <div className="p-8 bg-slate-900 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-12">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                Sub-Total
              </p>
              <p className="text-xl font-black text-white   leading-none">
                ₹{booking.totalBill + booking.discount}
              </p>
            </div>
            {booking.discount > 0 && (
              <div>
                <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] mb-1">
                  Discount
                </p>
                <p className="text-xl font-black text-red-400   leading-none">
                  -₹{booking.discount}
                </p>
              </div>
            )}
            <div>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">
                Net Payable
              </p>
              <p className="text-4xl font-black text-emerald-400   leading-none tracking-tighter">
                ₹{booking.totalBill}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all shadow-xl flex items-center gap-3"
          >
            <Printer size={18} /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
