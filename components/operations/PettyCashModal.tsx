"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { X, Loader2, Banknote } from "lucide-react";
import toast from "react-hot-toast";

export default function PettyCashModal({ isOpen, onClose, users }: any) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    userId: "",
    amount: "",
    reason: "",
    category: "STAFF_ADVANCE",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/operations/petty-cash", data),
    onSuccess: () => {
      toast.success("Cash withdrawal logged");
      queryClient.invalidateQueries({ queryKey: ["petty-cash"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold tracking-tight">Log Cash Outflow</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
          className="p-6 space-y-4"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Staff Member
            </label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
            >
              <option value="">Select Staff...</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Amount (₹)
            </label>
            <input
              type="number"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Purpose / Reason
            </label>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24"
              placeholder="e.g. Market purchase for kitchen, Staff advance..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <Banknote size={16} /> Record Transaction
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
