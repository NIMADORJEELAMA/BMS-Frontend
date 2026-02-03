// "use client";
// import { useState, useEffect, useCallback } from "react";
// import api from "@/lib/axios";
// import { io } from "socket.io-client";
// import toast from "react-hot-toast";

// const socket = io("http://localhost:3000");

// export default function TablesPage() {
//   const [tables, setTables] = useState([]);
//   const [selectedTable, setSelectedTable] = useState<any>(null);
//   const [activeOrder, setActiveOrder] = useState<any>(null);

//   // States for Table Management
//   const [isManageMode, setIsManageMode] = useState(false);
//   const [newTableLabel, setNewTableLabel] = useState("");
//   const [isAdding, setIsAdding] = useState(false);

//   const fetchTables = useCallback(async () => {
//     try {
//       const res = await api.get("/tables");
//       setTables(res.data);
//     } catch (err) {
//       console.error("Failed to fetch tables", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchTables();
//     socket.on("newOrder", (orderData) => {
//       fetchTables();
//       toast.success(`New Order: Table ${orderData.table.number}`, {
//         icon: "🔔",
//       });
//       if (selectedTable?.id === orderData.tableId) setActiveOrder(orderData);
//     });
//     return () => {
//       socket.off("newOrder");
//     };
//   }, [fetchTables, selectedTable]);

//   // --- ADMIN ACTIONS ---

//   const handleCreateTable = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newTableLabel.trim()) return;
//     setIsAdding(true);
//     try {
//       await api.post("/tables", { number: newTableLabel });
//       setNewTableLabel("");
//       fetchTables();
//       toast.success("Table created successfully");
//     } catch (err) {
//       toast.error("Error creating table. Number might exist.");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   const handleDeleteTable = async (e: React.MouseEvent, id: string) => {
//     e.stopPropagation(); // Prevent opening the modal
//     if (!confirm("Are you sure? This will permanently remove the table."))
//       return;
//     try {
//       await api.delete(`/tables/${id}`);
//       fetchTables();
//       toast.success("Table deleted");
//     } catch (err: any) {
//       toast.error(
//         err.response?.data?.message ||
//           "Cannot delete table with order history.",
//       );
//     }
//   };

//   const handleTableClick = async (table: any) => {
//     if (isManageMode) return; // Don't open order modal in manage mode
//     setSelectedTable(table);
//     if (table.status === "OCCUPIED") {
//       try {
//         const res = await api.get(`/orders/active/${table.id}`);
//         setActiveOrder(res.data);
//       } catch (err) {
//         setActiveOrder(null);
//       }
//     } else {
//       setActiveOrder(null);
//     }
//   };

//   return (
//     <div className="space-y-8 p-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Floor Plan</h1>
//           <p className="text-gray-500 text-sm">
//             Real-time table status for minizeo
//           </p>
//         </div>
//         <button
//           onClick={() => setIsManageMode(!isManageMode)}
//           className={`px-4 py-2 rounded-lg font-semibold transition-all ${
//             isManageMode
//               ? "bg-amber-100 text-amber-700 border border-amber-300"
//               : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//           }`}
//         >
//           {isManageMode ? "Exit Manage Mode" : "Manage Layout"}
//         </button>
//       </div>

//       {/* Admin Panel: Add Table */}
//       {isManageMode && (
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 animate-in slide-in-from-top duration-300">
//           <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">
//             Add New Table
//           </h2>
//           <form onSubmit={handleCreateTable} className="flex gap-3">
//             <input
//               type="text"
//               placeholder="e.g., T-05 or Window-1"
//               value={newTableLabel}
//               onChange={(e) => setNewTableLabel(e.target.value)}
//               className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//             <button
//               type="submit"
//               disabled={isAdding}
//               className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
//             >
//               {isAdding ? "Saving..." : "Create Table"}
//             </button>
//           </form>
//         </div>
//       )}

//       {/* Tables Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
//         {tables.map((table: any) => (
//           <div key={table.id} className="relative group">
//             {isManageMode && (
//               <button
//                 onClick={(e) => handleDeleteTable(e, table.id)}
//                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg z-10 hover:bg-red-600 transition-colors"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M18 6 6 18" />
//                   <path d="m6 6 12 12" />
//                 </svg>
//               </button>
//             )}

//             <button
//               onClick={() => handleTableClick(table)}
//               className={`w-full p-8 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${
//                 isManageMode
//                   ? "cursor-default opacity-80"
//                   : "hover:shadow-xl active:scale-95"
//               } ${
//                 table.status === "FREE"
//                   ? "bg-white border-gray-100 text-gray-400"
//                   : "bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-50/50"
//               }`}
//             >
//               <span className="text-2xl font-black">{table.number}</span>
//               <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-current bg-opacity-10">
//                 {table.status}
//               </span>
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* --- ORDER MODAL (Remains the same as your previous working version) --- */}
//       {selectedTable && !isManageMode && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//           <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
//             {/* ... Modal content ... */}
//             <div className="p-6 border-b flex justify-between items-center bg-gray-50">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">
//                   Table {selectedTable.number}
//                 </h2>
//                 <p className="text-sm text-gray-500">Active Order Details</p>
//               </div>
//               <button
//                 onClick={() => setSelectedTable(null)}
//                 className="text-gray-400 hover:text-gray-600 text-2xl p-2"
//               >
//                 &times;
//               </button>
//             </div>
//             <div className="p-6 min-h-[250px]">
//               {/* Same Logic as before for FREE/OCCUPIED items */}
//               {selectedTable.status === "FREE" ? (
//                 <div className="text-center py-10">
//                   <p className="text-gray-400">Empty Table</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {activeOrder?.items?.map((item: any) => (
//                     <div key={item.id} className="flex justify-between">
//                       <span>
//                         {item.quantity}x {item.menuItem.name}
//                       </span>
//                       <span className="font-bold">
//                         ₹{item.priceAtOrder * item.quantity}
//                       </span>
//                     </div>
//                   ))}
//                   <div className="border-t pt-4 flex justify-between font-bold text-xl">
//                     <span>Total</span>
//                     <span>₹{activeOrder?.totalAmount || 0}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="p-4 bg-gray-50 flex gap-3">
//               <button className="flex-1 py-3 bg-white border border-gray-300 rounded-xl font-bold">
//                 KOT
//               </button>
//               <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold">
//                 Generate Bill
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // 1. Fetch current layout
  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get("/tables");
      setTables(res.data);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // 2. Handle Create Table
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    setIsAdding(true);
    try {
      // Body matches your BE: { number: string }
      await api.post("/tables", { number: newTableNumber });
      setNewTableNumber("");
      fetchTables();
      toast.success(`Table ${newTableNumber} added!`);
    } catch (err) {
      toast.error("Error creating table. Number might already exist.");
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Handle Delete Table
  const handleDeleteTable = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete Table ${number}?`)) return;

    try {
      await api.delete(`/tables/${id}`);
      fetchTables();
      toast.success(`Table ${number} removed`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Cannot delete table with active history.",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Table Management
        </h1>
        <p className="text-gray-500">
          Configure your restaurant floor plan layout
        </p>
      </header>

      {/* Admin Panel: Add Table */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-4">
          Add New Table
        </h2>
        <form
          onSubmit={handleCreateTable}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="Enter Table Number (e.g., T-05)"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black transition-all"
            required
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isAdding ? "Saving..." : "Create Table"}
          </button>
        </form>
      </section>

      {/* Grid: View and Delete */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map((table: any) => (
          <div
            key={table.id}
            className="group relative bg-white p-8 rounded-3xl border-2 border-gray-100 flex flex-col items-center gap-3 transition-all hover:border-red-200 hover:shadow-md"
          >
            {/* Red Delete Button */}
            <button
              onClick={() => handleDeleteTable(table.id, table.number)}
              className="absolute top-3 right-3 bg-red-50 text-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              title="Delete Table"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <span className="text-3xl font-black text-gray-800">
              {table.number}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                table.status === "FREE"
                  ? "bg-green-50 text-green-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {table.status}
            </span>
          </div>
        ))}

        {tables.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400">
              Your floor is empty. Add your first table above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
