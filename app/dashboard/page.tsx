"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useSocket } from "../../hooks/useSocket";
import { useTableLayout } from "../../hooks/useDashboard";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import TableGrid from "../../components/dashboard/TableGrid";
import LiveOrderFeed from "../../components/dashboard/LiveOrderFeed";
import OrderModal from "../../components/OrderModal";
import { twMerge } from "tailwind-merge";
import { ClassValue, clsx } from "clsx";

const SOCKET_URL = "http://localhost:3000";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [areaType, setAreaType] = useState<"all" | "rooms" | "tables">("all");

  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // 2. Extract Unique Rooms from data
  const rooms = useMemo(() => {
    const allRooms = tables.map((t: any) => t.room).filter(Boolean);
    // Unique by ID
    return Array.from(new Map(allRooms.map((r: any) => [r.id, r])).values());
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((table: any) => {
      // Search filter
      const matchesSearch = table.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Area filter
      let matchesArea = true;
      if (areaType === "rooms") {
        matchesArea = table.room !== null;
      } else if (areaType === "tables") {
        matchesArea = table.room === null;
      }

      // Status filter
      const matchesStatus =
        statusFilter === "all" || table.status === statusFilter;

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [tables, searchQuery, areaType, statusFilter]);

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
    <div className="flex h-[92vh] bg-gray-50 overflow-hidden font-sans no-scrollbar">
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Unified Header with all props */}
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          areaType={areaType}
          setAreaType={setAreaType}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {/* Subtle result counter */}
          <div className="mb-4 flex justify-end items-center">
            <h2 className="text-sm font-semibold text-gray-500">
              Tables Count :{" "}
              <span className="ml-2 px-2 py-2  text-[12px]">
                {filteredTables.length}
              </span>
            </h2>
          </div>

          <TableGrid
            tables={filteredTables}
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
