"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Beer, X, Utensils } from "lucide-react";

interface OrderModalProps {
  table: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function OrderModal({
  table,
  onClose,
  onRefresh,
}: OrderModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Track if we are in "Receipt Mode"

  console.log("table", table);
  const [isBilled, setIsBilled] = useState(false);
  const fetchActiveOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/active/${table.id}`);
      setOrder(res.data);
      // If the order from DB is already BILLED, show receipt immediately
      if (res.data?.status === "BILLED") setIsBilled(true);
    } catch (err) {
      console.error("Error fetching order:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [table.id]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.on("tableUpdated", (data) => {
      if (data.tableId === table.id) {
        fetchActiveOrder();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [table.id, fetchActiveOrder]);

  // Inside OrderModal.tsx
  useEffect(() => {
    // If we already have the order data (from the History table), don't fetch active
    if (table.activeOrder) {
      setOrder(table.activeOrder);
      setIsBilled(
        table.activeOrder.status === "BILLED" ||
          table.activeOrder.status === "PAID",
      );
      setLoading(false);
      return;
    }

    // Existing fetchActiveOrder logic for the Dashboard...
  }, [table]);

  useEffect(() => {
    if (table.status === "OCCUPIED") {
      fetchActiveOrder();
    } else {
      setLoading(false);
    }
  }, [table.status, fetchActiveOrder]);

  const calculateTotal = () => {
    if (!order?.items) return 0;
    // Only sum SERVED items for the total
    return order.items.reduce((acc: number, item: any) => {
      if (item.status !== "SERVED") return acc;
      return acc + item.priceAtOrder * item.quantity;
    }, 0);
  };

  const handleSettle = async () => {
    if (!order) return;

    if (hasPending) {
      const confirmDrop = window.confirm(
        `There are ${pendingItems.length} items not served. They will be removed from the bill. Proceed?`,
      );
      if (!confirmDrop) return;
    }

    try {
      const res = await api.patch(`/orders/${order.id}/generate-bill`);
      setOrder(res.data);
      setIsBilled(true);
      toast.success("Bill Finalized (Pending items cancelled)");
      onRefresh();
    } catch (err) {
      toast.error("Failed to generate bill");
    }
  };

  const handleServeItem = async (itemId: string) => {
    try {
      await api.patch(`/orders/item/${itemId}/status`, { status: "SERVED" });
      toast.success("Item served");
      fetchActiveOrder();
      onRefresh();
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const handleServeAll = async () => {
    const pending =
      order?.items?.filter((i: any) => i.status !== "SERVED") || [];
    if (pending.length === 0) return;
    try {
      await Promise.all(
        pending.map((item: any) =>
          api.patch(`/orders/item/${item.id}/status`, { status: "SERVED" }),
        ),
      );
      toast.success("All items marked as served");
      fetchActiveOrder();
      onRefresh();
    } catch (err) {
      toast.error("Failed to serve all items");
    }
  };

  const pendingItems =
    order?.items?.filter(
      (i: any) =>
        i.status === "PENDING" ||
        i.status === "PREPARING" ||
        i.status === "READY",
    ) || [];
  const servedItems =
    order?.items?.filter((i: any) => i.status === "SERVED") || [];
  const hasPending = pendingItems?.length > 0;

  const handlePayment = async (method: "CASH" | "CARD" | "UPI") => {
    if (!order) return;

    try {
      const loadingToast = toast.loading(`Processing ${method} payment...`);

      await api.patch(`/orders/${order.id}/confirm-payment`, {
        paymentMode: method,
      });

      toast.dismiss(loadingToast);
      toast.success(`Payment successful via ${method}!`);

      // Finalize the UI state
      onRefresh(); // Ensure dashboard is synced
      onClose(); // Close modal after successful payment
    } catch (err) {
      toast.error("Payment confirmation failed");
      console.error(err);
    }
  };

  const TypeBadge = ({ type }: { type: "FOOD" | "ALCOHOL" }) => {
    const isAlcohol = type === "ALCOHOL";

    return (
      <span
        className={`flex items-center gap-1 text-[7px] font-black uppercase px-2 py-[2px] rounded-full tracking-wider ${
          isAlcohol
            ? "bg-purple-100 text-purple-700"
            : "bg-orange-100 text-orange-700"
        }`}
      >
        {isAlcohol ? (
          <>
            <Beer size={10} />
            {/* <span>Alcohol</span> */}
          </>
        ) : (
          <>
            <Utensils size={10} />
            {/* <span>Food</span> */}
          </>
        )}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
        {/* HEADER: Dynamic based on mode */}
        <div
          className={`${isBilled ? "bg-white text-gray-900 border-b-2 border-dashed" : "bg-gray-900 text-white"} p-6 flex justify-between items-center transition-colors duration-500`}
        >
          <div>
            <h3 className="text-xl font-black tracking-tight uppercase">
              {isBilled ? "Receipt Bill" : `Table ${table.name}`}
            </h3>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest ${isBilled ? "text-blue-600" : "text-gray-400"}`}
            >
              {`Order #${order?.id?.slice(0, 8)}`}
              {/* {isBilled ? `Order #${order?.id?.slice(0, 8)}` : "Guest Check"} */}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors text-2xl"
          >
            <X />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center text-gray-400 italic">
              Processing...
            </div>
          ) : isBilled ? (
            /* --- PROPER BILL VIEW --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                {servedItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-700">
                      <span className="font-bold text-gray-900">
                        {item.quantity}x
                      </span>{" "}
                      {item.menuItem.name}
                    </span>
                    <TypeBadge type={item.menuItem.type} />
                    <span className="font-mono text-sm font-bold text-gray-800">
                      ₹{item.priceAtOrder * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-gray-400 uppercase">
                    Grand Total
                  </span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">
                    ₹{order?.totalAmount || calculateTotal()}
                  </span>
                </div>
              </div>

              {/* Payment Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => handlePayment("CASH")}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-green-600 hover:text-white transition-all group"
                >
                  <span className="text-xl mb-1 text-green-600 group-hover:text-white transition-colors">
                    💵
                  </span>
                  <span className="text-[10px] font-black uppercase group-hover:text-white">
                    Confirm Cash
                  </span>
                </button>

                <button
                  onClick={() => handlePayment("UPI")}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-600 hover:text-white transition-all group"
                >
                  <span className="text-xl mb-1 text-blue-600 group-hover:text-white transition-colors">
                    📱
                  </span>
                  <span className="text-[10px] font-black uppercase group-hover:text-white">
                    Confirm UPI
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* --- ORIGINAL MANAGEMENT VIEW --- */
            <div className="space-y-8">
              {!order ? (
                <div className="py-20 text-center text-gray-400 italic">
                  No active session.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        Pending Preparation
                      </h4>
                      {pendingItems.length > 0 && (
                        <button
                          onClick={handleServeAll}
                          className="text-[10px] font-bold text-blue-600 hover:underline uppercase cursor-pointer tracking-wider"
                        >
                          Serve All
                        </button>
                      )}
                    </div>
                    {pendingItems.length > 0 ? (
                      pendingItems.map((item: any) => (
                        <div
                          key={item.id}
                          className={`flex justify-between items-center p-2 px-4 rounded-2xl ${
                            item.status === "READY"
                              ? "bg-green-50 border-2 border-green-300"
                              : "bg-amber-50 border border-amber-100"
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-gray-800 text-[14px]">
                              {item.quantity}x {item.menuItem.name}
                            </span>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase tracking-tighter ${
                                  item.status === "READY"
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {item.status === "READY"
                                  ? "Ready to Serve"
                                  : "Kitchen"}
                              </span>

                              <TypeBadge type={item.menuItem.type} />
                            </div>
                          </div>

                          <button
                            onClick={() => handleServeItem(item.id)}
                            className={`p-1 rounded-xl shadow-sm hover:text-white transition-all cursor-pointer tracking-wider ${
                              item.status === "READY"
                                ? "bg-white text-green-600 border border-green-200 hover:bg-green-600"
                                : "bg-white text-amber-600 border border-amber-200 hover:bg-amber-600"
                            }`}
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic px-1">
                        All items served.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                      Served & On-Table
                    </h4>
                    <div className="space-y-2">
                      {servedItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-1 bg-gray-50 border border-gray-100 rounded-xl opacity-80"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="font-mono text-xs font-bold text-gray-500 pr-2">
                            ₹{item.priceAtOrder * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">
                        Taxable Subtotal
                      </p>
                      <h4 className="text-sm font-bold text-gray-800">
                        Net Payable
                      </h4>
                    </div>
                    <span className="text-3xl font-black text-blue-600 tracking-tighter">
                      ₹{calculateTotal()}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-gray-50 border-t flex gap-3">
          {isBilled ? (
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all uppercase tracking-widest"
            >
              Finished & Close
            </button>
          ) : (
            <>
              <button className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all cursor-pointer tracking-wider">
                Print KOT
              </button>
              <button
                onClick={handleSettle}
                disabled={!order} // Only disable if there is no order at all
                className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg cursor-pointer tracking-wider ${
                  hasPending
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {hasPending ? "Bill Served Items Only" : "Generate Bill"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
