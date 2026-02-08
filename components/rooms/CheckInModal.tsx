"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X, Loader2, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckInModal({ isOpen, onClose }: any) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    roomId: "",
    guestName: "",
    guestPhone: "",
  });

  // Only fetch rooms that are AVAILABLE
  const { data: rooms = [] } = useQuery({
    queryKey: ["available-rooms"],
    queryFn: async () =>
      (await api.get("/rooms")).data.filter(
        (r: any) => r.status === "AVAILABLE" && r.isActive,
      ),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/rooms/check-in", data),
    onSuccess: () => {
      toast.success("Guest Checked In Successfully");
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            Guest Check-In
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
          className="p-8 space-y-5"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Select Available Room
            </label>
            <select
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              required
            >
              <option value="">Choose a room...</option>
              {rooms.map((r: any) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} - ₹{r.basePrice} ({r.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Guest Name
            </label>
            <input
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
              placeholder="Full Name"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Phone Number
            </label>
            <input
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
              placeholder="+91 ..."
              value={form.guestPhone}
              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <LogIn size={16} /> Complete Check-In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
