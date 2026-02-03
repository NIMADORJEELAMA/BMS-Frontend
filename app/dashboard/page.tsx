"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TableCard from "../../components/TableCard";
import { useSocket } from "../../hooks/useSocket";
import OrderModal from "../../components/OrderModal";
import { Toaster, toast } from "react-hot-toast";

export default function DashboardPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [liveOrders, setLiveOrders] = useState<any[]>([]); // New state for the sidebar

  const fetchLayout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/orders/table-layout", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const handleSocketUpdate = useCallback(
    (orderData: any) => {
      // 1. Add new order to the list (to the end/bottom)
      setLiveOrders((prev) => [...prev, orderData]);

      // 2. Visual & Audio Feedback
      toast.success(
        `New Order: Table ${orderData.table?.number || "Updated"}`,
        {
          icon: "🔔",
        },
      );

      // 3. Refresh Grid
      fetchLayout();
    },
    [fetchLayout],
  );

  useSocket(handleSocketUpdate);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />

      {/* LEFT: Main Content (Floor Plan) */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              minizeo Dashboard
            </h2>
            <p className="text-gray-500 font-medium">
              Real-time Dining Floor Status
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM LIVE
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table: any) => (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className="cursor-pointer"
            >
              <TableCard {...table} />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Live Order Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Live Order Feed</h3>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">
            Chronological View
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {liveOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6 italic">
              <p>Waiting for incoming orders...</p>
            </div>
          ) : (
            liveOrders.map((order, index) => (
              <div
                key={order.id || index}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-right duration-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                    TABLE {order.table?.number}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {order.waiter?.name || "Waiter"} placed an order
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  {order.items?.length} items • ₹
                  {order.items?.reduce(
                    (sum: number, i: any) => sum + i.priceAtOrder * i.quantity,
                    0,
                  )}
                </div>
              </div>
            ))
          )}
          {/* Invisible element to auto-scroll to bottom */}
          <div id="end-of-feed" />
        </div>

        <div className="p-4 border-t bg-white">
          <button
            onClick={() => setLiveOrders([])}
            className="w-full text-xs font-bold text-gray-400 hover:text-red-500 transition-colors py-2 uppercase tracking-tighter"
          >
            Clear Feeds
          </button>
        </div>
      </aside>

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onRefresh={fetchLayout}
        />
      )}
    </div>
  );
}
