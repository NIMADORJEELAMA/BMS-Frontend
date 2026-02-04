"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useSocket } from "../../hooks/useSocket";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import TableGrid from "../../components/dashboard/TableGrid";
import LiveOrderFeed from "../../components/dashboard/LiveOrderFeed";
import OrderModal from "../../components/OrderModal";
import { io } from "socket.io-client";

export default function DashboardPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  // const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const SOCKET_URL = "http://localhost:3000"; // Your NestJS port

  const [liveOrders, setLiveOrders] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("minizeo_live_orders");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  useEffect(() => {
    localStorage.setItem("minizeo_live_orders", JSON.stringify(liveOrders));
  }, [liveOrders]);
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

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on("tableUpdated", (data) => {
      // This will trigger a fresh fetch of all tables,
      // making the billed table appear FREE again.
      fetchLayout();
      // toast.success("Table is now free!");
    });

    return () => {
      socket.off("tableUpdated");
    };
  }, [fetchLayout]);

  // DashboardPage.tsx

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("itemStatusUpdated", (data) => {
      if (data.status === "READY") {
        // Find table number from your tables state
        const table = tables.find((t) => t?.activeOrder?.id === data.orderId);

        toast(`Table ${table?.number || ""}: Food is READY!`, {
          icon: "🍳",
          duration: 6000,
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: "bold",
          },
        });

        // Refresh layout to show the notification badge on the table
        fetchLayout();
      }
    });

    return () => {
      socket.off("itemStatusUpdated");
    };
  }, [tables, fetchLayout]);
  useSocket(
    useCallback(
      (orderData: any) => {
        // 1. Add the timestamp the moment it arrives
        const orderWithTimestamp = {
          ...orderData,
          receivedAt: new Date().toISOString(),
        };

        setLiveOrders((prev) => {
          const updated = [...prev, orderWithTimestamp]; // Use the timestamped order
          return updated.slice(-50); // Keep only latest 50
        });

        toast.success(`New Order: Table ${orderData.table?.number}`, {
          icon: "🔔",
        });

        fetchLayout();
      },
      [fetchLayout],
    ),
  );

  const handleViewTableFromFeed = (tableId: string) => {
    const table = tables.find((t: any) => t.id === tableId);
    if (table) {
      setSelectedTable(table);
    } else {
      toast.error("Table not found in current layout");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Pass search state to header */}
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <TableGrid
            tables={tables}
            searchQuery={searchQuery} // Pass to grid for filtering
            onTableClick={(table: any) => setSelectedTable(table)}
          />
        </main>
      </div>

      <LiveOrderFeed
        orders={liveOrders}
        onClear={() => setLiveOrders([])}
        onSelectOrder={handleViewTableFromFeed}
      />

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
