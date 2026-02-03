"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

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

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        setLoading(true);
        // Calling your specific endpoint
        const res = await api.get(`/orders/active/${table.id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (table.status === "OCCUPIED") {
      fetchActiveOrder();
    } else {
      setLoading(false);
    }
  }, [table.id, table.status]);

  // Calculate Subtotal dynamically since totalAmount is null in 'CREATED' status
  const calculateTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((acc: number, item: any) => {
      return acc + item.priceAtOrder * item.quantity;
    }, 0);
  };

  const handleSettle = async () => {
    if (!order) return;
    try {
      await api.post(`/orders/${order.id}/bill`);
      toast.success("Bill generated successfully!");
      onRefresh();
      onClose();
    } catch (err) {
      toast.error("Failed to settle bill");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Table {table.number}
            </h3>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
              {table.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10 italic text-gray-400">
              Loading order details...
            </div>
          ) : !order ? (
            <div className="text-center py-10 text-gray-400">
              <p>No active order found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="flex justify-between text-xs text-gray-500 font-bold border-b pb-2">
                <span>ORDER ID: {order.id.split("-")[0].toUpperCase()}</span>
                <span>
                  STATUS: <span className="text-blue-600">{order.status}</span>
                </span>
              </div>

              {/* Items List - Mapping your shared JSON structure */}
              <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-700">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.menuItem.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{item.priceAtOrder} per unit
                        </p>
                      </div>
                    </div>
                    <p className="font-mono font-bold text-gray-900">
                      ₹{item.priceAtOrder * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-700">
                  Total Payable
                </span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">
                  ₹{calculateTotal()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex gap-3">
          <button className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all">
            Print KOT
          </button>
          <button
            onClick={handleSettle}
            disabled={table.status === "FREE" || !order}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            Settle Bill
          </button>
        </div>
      </div>
    </div>
  );
}
