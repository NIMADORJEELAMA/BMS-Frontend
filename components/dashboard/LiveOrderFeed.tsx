import { useEffect, useRef } from "react";
import { Bell, Trash2, ChefHat, Clock } from "lucide-react";

export default function LiveOrderFeed({ orders, onClear, onSelectOrder }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  console.log("orders", orders);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orders]);

  return (
    <aside className="w-80 bg-white/70 backdrop-blur-xl border-l border-gray-200 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white/60 backdrop-blur-xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <Bell className="text-blue-600" size={18} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight">
              Live Activity
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Kitchen & Bar Feed
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        // Changed min-2xl to max-w-2xl or min-h-[500px]
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/60 to-white/30 min-w-[320px]"
      >
        {orders.map((order: any, idx: number) => (
          <div
            key={`${order.id}-${order.receivedAt || idx}`}
            className={`relative group p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-[1px] ${
              order.isAddOn
                ? "bg-gradient-to-br from-amber-50 to-white border-amber-200"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            }`}
          >
            {/* Glow */}
            <div
              className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition ${
                order.isAddOn ? "bg-amber-200/40" : "bg-blue-200/30"
              }`}
            />

            {/* Header */}
            <div className="relative flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] text-white px-3 py-1 rounded-full font-black tracking-wider ${
                    order.isAddOn ? "bg-amber-600" : "bg-blue-600"
                  }`}
                >
                  {order.table?.number}
                </span>

                {order.isAddOn && (
                  <span className="text-[9px] font-black text-amber-700 uppercase animate-pulse">
                    Add-on
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-white/60 px-2 py-1 rounded-full">
                <Clock size={10} />
                {new Date(order.receivedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Items */}
            <div className="relative mb-4 space-y-2">
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <ChefHat size={12} /> Preparation Queue
              </p>

              <div className="space-y-2">
                {order.displayItems?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-white/70 backdrop-blur border border-gray-100 p-1 px-2 rounded-xl"
                  >
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-blue-600 font-black">
                        {item.quantity}×
                      </span>
                      {item.menuItem?.name || item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative flex justify-between items-center pt-3 border-t border-gray-100">
              <div>
                <p className="text-[11px] font-bold text-gray-700">
                  {order.waiter?.name || "Staff"}
                </p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">
                  Order Handler
                </p>
              </div>

              <button
                onClick={() => onSelectOrder(order.tableId)}
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition cursor-pointer tracking-wider"
              >
                View Bill →
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              No Live Orders
            </p>
            <p className="text-xs text-gray-400 mt-1">Waiting for activity…</p>
          </div>
        )}
      </div>
    </aside>
  );
}
