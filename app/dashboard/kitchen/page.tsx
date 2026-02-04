"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Printer, CheckCircle, Clock } from "lucide-react";

export default function KitchenPage() {
  const [rawItems, setRawItems] = useState([]);
  const socket = useMemo(() => io("http://localhost:3000"), []);

  const fetchKitchenQueue = async () => {
    try {
      const res = await api.get("/orders/kitchen/pending");
      setRawItems(res.data);
    } catch (err) {
      console.error("Error fetching kitchen queue:", err);
    }
  };

  // Group items by Order ID
  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: any } = {};
    rawItems.forEach((item: any) => {
      const orderId = item.orderId;
      if (!groups[orderId]) {
        groups[orderId] = {
          id: orderId,
          tableNumber: item.order?.table?.number,
          createdAt: item.createdAt,
          items: [],
        };
      }
      groups[orderId].items.push(item);
    });
    return Object.values(groups).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [rawItems]);

  useEffect(() => {
    fetchKitchenQueue();
    socket.on("kitchenUpdate", () => {
      new Audio("/Notification.mp3").play().catch(() => {});
      fetchKitchenQueue();
      toast.success("New KOT Received!");
    });
    return () => {
      socket.off("kitchenUpdate");
    };
  }, [socket]);

  const handleMarkItemReady = async (itemId: string) => {
    try {
      await api.patch(`/orders/item/${itemId}/status`, { status: "READY" });
      fetchKitchenQueue();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleMarkReady = async (itemId: string) => {
    try {
      await api.patch(`/orders/item/${itemId}/status`, { status: "READY" });

      // This triggers the 'itemStatusUpdated' socket event in your backend
      toast.success("Notified waiter: Food is ready!");
      fetchKitchenQueue();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleMarkEntireOrderReady = async (order: any) => {
    try {
      // Create a list of promises for each item in this order that isn't already ready/served
      const updatePromises = order.items
        .filter(
          (item: any) => item.status !== "READY" && item.status !== "SERVED",
        )
        .map((item: any) =>
          api.patch(`/orders/item/${item.id}/status`, { status: "READY" }),
        );

      if (updatePromises.length === 0) {
        toast.error("Items are already ready or served");
        return;
      }

      await Promise.all(updatePromises);
      toast.success(`Table ${order.tableNumber} is ready for pick up!`, {
        icon: "🚀",
        style: { borderRadius: "10px", background: "#10b981", color: "#fff" },
      });
      fetchKitchenQueue();
    } catch (err) {
      toast.error("Failed to mark order as ready");
    }
  };
  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            minizeo kitchen
          </h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
            Live Production Feed
          </p>
        </div>
        <div className="bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800 text-green-500 font-black">
          {groupedOrders.length} ACTIVE TICKETS
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupedOrders.map((order: any) => (
          <div
            key={order.id}
            className="bg-zinc-900 border-2 border-zinc-800 rounded-[32px] flex flex-col shadow-2xl"
          >
            {/* Ticket Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/30">
              <div className="flex items-center gap-3">
                <span className="bg-white text-black w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">
                  {order.tableNumber}
                </span>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase">
                    Table
                  </p>
                  <p className="text-xs font-bold font-mono">
                    #{order.id.slice(0, 5)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Clock size={16} className="text-zinc-600 mb-1 ml-auto" />
                <p className="text-[10px] font-black text-zinc-500">
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Item List */}
            <div className="p-6 space-y-4 flex-1">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-zinc-700 group-hover:text-amber-500 transition-colors">
                      {item.quantity}×
                    </span>
                    <div>
                      <p className="text-lg font-bold text-zinc-200 uppercase tracking-tight">
                        {item.menuItem?.name}
                      </p>
                      {item.status === "PREPARING" && (
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                          Cooking...
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkItemReady(item.id)}
                    className="p-3 bg-zinc-800 hover:bg-green-600 rounded-2xl transition-all text-zinc-500 hover:text-white"
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-zinc-800/50 flex gap-3">
              <button
                disabled
                className="flex-1 py-4 bg-zinc-800 text-zinc-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Printer size={16} /> Print KOT
              </button>
              <button
                onClick={() => handleMarkEntireOrderReady(order)}
                className="flex-[2] py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-900/20"
              >
                <CheckCircle size={16} /> Mark Order Ready
              </button>
            </div>
          </div>
        ))}
      </div>

      {groupedOrders.length === 0 && (
        <div className="text-center py-40">
          <p className="text-zinc-800 text-6xl font-black uppercase italic">
            Kitchen Clear
          </p>
          <p className="text-zinc-600 font-bold uppercase tracking-[0.5em] mt-4">
            Waiting for orders
          </p>
        </div>
      )}
    </div>
  );
}
