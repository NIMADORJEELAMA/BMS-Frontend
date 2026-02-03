// import { useEffect, useRef } from "react";

// export default function LiveOrderFeed({ orders, onClear, onSelectOrder }: any) {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [orders]);

//   return (
//     <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
//       <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
//         <div>
//           <h3 className="text-lg font-bold text-gray-800 tracking-tight">
//             Activity Feed
//           </h3>
//           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
//             Real-time History
//           </p>
//         </div>
//         <button
//           onClick={onClear}
//           className="text-gray-300 hover:text-red-500 transition-colors"
//         >
//           <svg
//             width="18"
//             height="18"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//           >
//             <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
//           </svg>
//         </button>
//       </div>

//       <div
//         ref={scrollRef}
//         className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
//       >
//         {orders.map((order: any, idx: any) => (
//           <div
//             key={order.id || idx}
//             className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all animate-in slide-in-from-right duration-300"
//           >
//             <div className="flex justify-between items-center mb-3">
//               <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-black">
//                 TABLE {order.table?.number}
//               </span>
//               <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
//                 {new Date(order.receivedAt).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </span>
//             </div>

//             <div className="flex justify-between items-end">
//               <div>
//                 <p className="text-sm font-bold text-gray-700">
//                   {order.waiter?.name}
//                 </p>
//                 <p className="text-[11px] text-gray-500">
//                   {order.items?.length || 0} items ordered
//                 </p>
//               </div>
//               <button
//                 onClick={() => onSelectOrder(order.tableId)}
//                 className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
//               >
//                 View Table →
//               </button>
//             </div>
//           </div>
//         ))}

//         {orders.length === 0 && (
//           <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
//             <span className="text-4xl mb-2">📥</span>
//             <p className="text-sm font-bold uppercase">No Orders Yet</p>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }

import { useEffect, useRef } from "react";

export default function LiveOrderFeed({ orders, onClear, onSelectOrder }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  console.log("orders", orders);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [orders]);

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
      <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">
            Activity Feed
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            KOT & Preparation
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
      >
        {orders.map((order: any, idx: any) => (
          <div
            key={`${order.id}-${order.receivedAt || idx}`}
            className={`group p-4 rounded-2xl border transition-all animate-in slide-in-from-right duration-300 shadow-sm ${
              order.isAddOn
                ? "bg-amber-50/50 border-amber-100 hover:border-amber-300"
                : "bg-white border-gray-100 hover:border-blue-200"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] text-white px-2 py-0.5 rounded-md font-black ${
                    order.isAddOn ? "bg-amber-600" : "bg-blue-600"
                  }`}
                >
                  TABLE {order.table?.number}
                </span>
                {order.isAddOn && (
                  <span className="text-[9px] font-black text-amber-700 uppercase animate-pulse">
                    Add-on
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono bg-white/50 px-1.5 py-0.5 rounded">
                {new Date(order.receivedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Preparation List (KOT) */}
            <div className="mb-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                Items to Prepare:
              </p>
              <div className="space-y-1">
                {order.displayItems?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-white/40 p-1.5 rounded-lg border border-black/5"
                  >
                    <span className="font-bold text-gray-800">
                      <span className="text-blue-600 mr-1">
                        {item.quantity}x
                      </span>{" "}
                      {item.menuItem?.name || item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-black/5">
              <div>
                <p className="text-[11px] font-bold text-gray-700">
                  {order.waiter?.name}
                </p>
              </div>
              <button
                onClick={() => onSelectOrder(order.tableId)}
                className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
              >
                Full Bill →
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
            <span className="text-4xl mb-2">📥</span>
            <p className="text-sm font-bold uppercase">No Orders Yet</p>
          </div>
        )}
      </div>
    </aside>
  );
}
