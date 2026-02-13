"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Printer, CheckCircle, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="  mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kitchen Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Live Production Queue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {groupedOrders.length} Active Tickets
            </Badge>
          </div>
        </div>

        {/* GRID */}
        {groupedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedOrders.map((order: any) => (
              <Card
                key={order.id}
                className="rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                {/* Ticket Header */}
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {order.tableNumber}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Order #{order.id.slice(0, 6)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock size={14} />
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <Badge variant="secondary">Preparing</Badge>
                </CardHeader>

                <Separator />

                {/* Items */}
                <CardContent className="space-y-4 py-4">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {item.quantity}×
                        </span>

                        <div>
                          <p className="font-medium">{item.menuItem?.name}</p>

                          {item.status === "PREPARING" && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Cooking
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleMarkItemReady(item.id)}
                      >
                        <CheckCircle size={18} />
                      </Button>
                    </div>
                  ))}
                </CardContent>

                <Separator />

                {/* Footer */}
                <CardFooter className="flex gap-3">
                  <Button variant="secondary" className="flex-1" disabled>
                    <Printer size={16} className="mr-2" />
                    Print KOT
                  </Button>

                  <Button
                    className="flex-1"
                    onClick={() => handleMarkEntireOrderReady(order)}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Mark Ready
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <CheckCircle size={40} className="text-green-500 mb-4" />
              <h2 className="text-xl font-semibold">Kitchen Clear</h2>
              <p className="text-muted-foreground mt-2">
                Waiting for new orders...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
