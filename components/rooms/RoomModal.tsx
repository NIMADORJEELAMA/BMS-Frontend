"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function RoomModal({ isOpen, onClose, initialData }: any) {
  const queryClient = useQueryClient();

  // Initialize form with initialData if editing, else empty
  const [form, setForm] = useState({
    roomNumber: "",
    type: "DELUXE",
    basePrice: "",
  });

  // Sync form state when initialData changes (for Editing)
  useEffect(() => {
    if (initialData) {
      setForm({
        roomNumber: initialData.roomNumber,
        type: initialData.type,
        basePrice: initialData.basePrice.toString(),
      });
    } else {
      setForm({ roomNumber: "", type: "DELUXE", basePrice: "" });
    }
  }, [initialData, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (initialData) {
        // UPDATE MODE
        return api.patch(`/rooms/${initialData.id}`, data);
      }
      // CREATE MODE
      return api.post("/rooms", data);
    },
    onSuccess: () => {
      toast.success(initialData ? "Room updated" : "Room created");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Action failed"),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            {initialData
              ? `Edit Room ${initialData.roomNumber}`
              : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full"
          >
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
              Room Number
            </label>
            <input
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Type
            </label>
            <select
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="STANDARD">STANDARD</option>
              <option value="DELUXE">DELUXE</option>
              <option value="SUITE">SUITE</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Price (₹)
            </label>
            <input
              type="number"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black italic"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Save size={16} /> {initialData ? "Update Room" : "Save Room"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
