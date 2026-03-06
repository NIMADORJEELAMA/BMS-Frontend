// import { useEffect, useRef } from "react";
// import { Bell, Trash2, ChefHat, Clock } from "lucide-react";

// export default function LiveOrderFeed({ orders, onClear, onSelectOrder }: any) {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         console.log("Tab active: Re-syncing orders...");
//         // Trigger a manual refetch or signal your socket to catch up
//         // queryClient.invalidateQueries(['orders'])
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () =>
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [orders]);

//   return (
//     <aside className="w-80 bg-white/70 backdrop-blur-xl border-l border-gray-200 flex flex-col shadow-2xl">
//       {/* Header */}
//       <div className="p-5 border-b border-gray-200 bg-white/60 backdrop-blur-xl flex justify-between items-center">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
//             <Bell className="text-blue-600" size={18} />
//           </div>
//           <div>
//             <h3 className="text-lg font-black text-gray-800 tracking-tight">
//               Live Activity
//             </h3>
//             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
//               Kitchen & Bar Feed
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={onClear}
//           className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
//         >
//           <Trash2 size={18} />
//         </button>
//       </div>

//       {/* Feed */}
//       <div
//         ref={scrollRef}
//         // Changed min-2xl to max-w-2xl or min-h-[500px]
//         className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/60 to-white/30 min-w-[320px]"
//       >
//         {orders.map((order: any, idx: number) => (
//           <div
//             key={`${order.id}-${order.receivedAt || idx}`}
//             className={`relative group p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-[1px] ${
//               order.isAddOn
//                 ? "bg-gradient-to-br from-amber-50 to-white border-amber-200"
//                 : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
//             }`}
//           >
//             {/* Glow */}
//             <div
//               className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition ${
//                 order.isAddOn ? "bg-amber-200/40" : "bg-blue-200/30"
//               }`}
//             />

//             {/* Header */}
//             <div className="relative flex justify-between items-center mb-3">
//               <div className="flex items-center gap-2">
//                 <span
//                   className={`text-[10px] text-white px-3 py-1 rounded-full font-black tracking-wider ${
//                     order.isAddOn ? "bg-amber-600" : "bg-blue-600"
//                   }`}
//                 >
//                   {order.table?.number}
//                 </span>

//                 {order.isAddOn && (
//                   <span className="text-[9px] font-black text-amber-700 uppercase animate-pulse">
//                     Add-on
//                   </span>
//                 )}
//               </div>

//               <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-white/60 px-2 py-1 rounded-full">
//                 <Clock size={10} />
//                 {new Date(order.receivedAt).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </div>
//             </div>

//             {/* Items */}
//             <div className="relative mb-4 space-y-2">
//               <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                 <ChefHat size={12} /> Preparation Queue
//               </p>

//               <div className="space-y-2">
//                 {order.displayItems?.map((item: any, i: number) => (
//                   <div
//                     key={i}
//                     className="flex justify-between items-center text-sm bg-white/70 backdrop-blur border border-gray-100 p-1 px-2 rounded-xl"
//                   >
//                     <span className="font-bold text-gray-800 flex items-center gap-2">
//                       <span className="text-blue-600 font-black">
//                         {item.quantity}×
//                       </span>
//                       {item.menuItem?.name || item.name}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="relative flex justify-between items-center pt-3 border-t border-gray-100">
//               <div>
//                 <p className="text-[11px] font-bold text-gray-700">
//                   {order.waiter?.name || "Staff"}
//                 </p>
//                 <p className="text-[9px] text-gray-400 uppercase tracking-wider">
//                   Order Handler
//                 </p>
//               </div>

//               <button
//                 onClick={() => onSelectOrder(order.tableId)}
//                 className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition cursor-pointer tracking-wider"
//               >
//                 View Bill →
//               </button>
//             </div>
//           </div>
//         ))}

//         {/* Empty State */}
//         {orders.length === 0 && (
//           <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
//             <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
//               <Bell size={28} className="text-gray-400" />
//             </div>
//             <p className="text-sm font-black uppercase tracking-widest text-gray-400">
//               No Live Orders
//             </p>
//             <p className="text-xs text-gray-400 mt-1">Waiting for activity…</p>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }

"use client";
import { useEffect, useRef } from "react";
import { Bell, Trash2, ChefHat, Clock } from "lucide-react";

export default function LiveOrderFeed({ orders, onClear, onSelectOrder }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only when new orders arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [orders]);

  return (
    <aside className="w-80 mb-16 bg-white/70 backdrop-blur-xl border-l border-gray-200 flex flex-col shadow-2xl min-h-screen sticky top-0">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <Bell className="text-blue-600 animate-tada" size={18} />
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
          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Feed Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 scroll-smooth mb-16"
      >
        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          orders.map((order: any, idx: number) => (
            <OrderCard
              key={`${order.id}-${idx}`}
              order={order}
              onSelect={onSelectOrder}
            />
          ))
        )}
      </div>
    </aside>
  );
}

// Sub-component for cleaner code
function OrderCard({ order, onSelect }: any) {
  return (
    <div
      className={`relative group p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
        order.isAddOn
          ? "bg-gradient-to-br from-amber-50 to-white border-amber-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] text-white px-3 py-1 rounded-full font-black ${
              order.isAddOn ? "bg-amber-600" : "bg-blue-600"
            }`}
          >
            T-{order.table?.number || "N/A"}
          </span>
          {order.isAddOn && (
            <span className="text-[9px] font-black text-amber-700 uppercase animate-pulse">
              Add-on
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
          <Clock size={10} />
          {new Date(order.receivedAt || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.displayItems?.map((item: any, i: number) => (
          <div
            key={i}
            className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg border border-gray-100"
          >
            <span className="font-bold text-gray-800">
              <span className="text-blue-600 mr-2">{item.quantity}×</span>
              {item.menuItem?.name || item.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-[11px] font-bold text-gray-600 truncate max-w-[120px]">
          {order.waiter?.name || "Staff"}
        </span>
        <button
          onClick={() => onSelect(order.tableId)}
          className="text-[10px] font-black text-blue-600 hover:underline uppercase"
        >
          View Bill →
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
      <Bell size={40} className="text-gray-300 mb-4" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Waiting for orders...
      </p>
    </div>
  );
}
