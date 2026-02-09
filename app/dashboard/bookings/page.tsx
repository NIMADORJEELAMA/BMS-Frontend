"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { UserPlus, Phone, Loader2, Receipt } from "lucide-react";
import CheckInModal from "@/components/rooms/CheckInModal";
import CheckOutSummary from "@/components/rooms/CheckOutSummary"; // We'll create this next
import toast from "react-hot-toast";

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["active-bookings"],
    queryFn: async () => (await api.get("/rooms/bookings/active")).data,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (id: string) =>
      (await api.post(`/rooms/check-out/${id}`)).data,
    onSuccess: (data) => {
      // Data contains the breakdown (Room Total + Food Total)
      setCheckoutData(data);
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Checkout processed");
    },
    onError: () => toast.error("Checkout failed"),
  });

  const handleCheckOut = (booking: any) => {
    if (window.confirm(`Process checkout for ${booking.guestName}?`)) {
      checkoutMutation.mutate(booking.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
            Front Desk
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Live Guest Lists
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
        >
          <UserPlus size={16} /> New Check-In
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">Guest Details</th>
              <th className="px-8 py-5">Room</th>
              <th className="px-8 py-5">Check-In Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-slate-200" />
                </td>
              </tr>
            ) : (
              bookings.map((booking: any) => (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900 uppercase italic">
                      {booking.guestName}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-1">
                      <Phone size={10} /> {booking.guestPhone || "No Phone"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black italic">
                      ROOM {booking.room.roomNumber}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">
                    {new Date(booking.checkIn).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setActiveBookingId(booking.id)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                    >
                      View Bill & Checkout
                    </button>
                    {/* <button
                      onClick={() => handleCheckOut(booking)}
                      disabled={checkoutMutation.isPending}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {checkoutMutation.isPending ? "..." : "Checkout"}
                    </button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <CheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {checkoutData && (
        <CheckOutSummary
          data={checkoutData}
          onClose={() => setCheckoutData(null)}
        />
      )}

      {activeBookingId && (
        <CheckOutSummary
          bookingId={activeBookingId}
          onClose={() => setActiveBookingId(null)}
        />
      )}
    </div>
  );
}
