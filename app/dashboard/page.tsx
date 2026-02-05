"use client";
import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useSocket } from "../../hooks/useSocket";
import { useTableLayout } from "../../hooks/useDashboard";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import TableGrid from "../../components/dashboard/TableGrid";
import LiveOrderFeed from "../../components/dashboard/LiveOrderFeed";
import OrderModal from "../../components/OrderModal";

const SOCKET_URL = "http://localhost:3000";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // TanStack Query replaces fetchLayout, tables state, and loading states
  const { data: tables = [], refetch: refreshLayout } = useTableLayout();

  // Keep Live Orders in local state (or a separate Query if saved to DB)
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

  // Handle Socket Events
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("tableUpdated", () => {
      // Instead of manual fetch, we tell TanStack to refresh
      queryClient.invalidateQueries({ queryKey: ["table-layout"] });
    });

    socket.on("itemStatusUpdated", (data) => {
      if (data.status === "READY") {
        const table = tables.find(
          (t: any) => t?.activeOrder?.id === data.orderId,
        );
        toast(`Table ${table?.number || ""}: Food is READY!`, {
          icon: "🍳",
          style: { background: "#10b981", color: "#fff" },
        });
        queryClient.invalidateQueries({ queryKey: ["table-layout"] });
      }
    });

    return () => {
      socket.off("tableUpdated");
      socket.off("itemStatusUpdated");
    };
  }, [tables, queryClient]);

  // Socket for New Orders
  useSocket(
    useCallback(
      (orderData: any) => {
        const orderWithTimestamp = {
          ...orderData,
          receivedAt: new Date().toISOString(),
        };

        setLiveOrders((prev) => [...prev, orderWithTimestamp].slice(-50));
        toast.success(`New Order: Table ${orderData.table?.number}`, {
          icon: "🔔",
        });

        queryClient.invalidateQueries({ queryKey: ["table-layout"] });
      },
      [queryClient],
    ),
  );

  const handleViewTableFromFeed = (tableId: string) => {
    const table = tables.find((t: any) => t.id === tableId);
    if (table) setSelectedTable(table);
    else toast.error("Table not found");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <TableGrid
            tables={tables}
            searchQuery={searchQuery}
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
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ["table-layout"] })
          }
        />
      )}
    </div>
  );
}
