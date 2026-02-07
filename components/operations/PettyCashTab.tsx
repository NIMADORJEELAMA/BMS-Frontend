"use client";
import { useState } from "react";
import { useDeletePettyCash, usePettyCash } from "@/hooks/useOperations";
import { useUsers } from "@/hooks/useUsers";
import PettyCashModal from "./PettyCashModal"; // The modal we created earlier
import { Plus, Search, Calendar, Wallet, Loader2, Trash2 } from "lucide-react";

export default function PettyCashTab() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = usePettyCash(startDate, endDate);
  const { data: users = [] } = useUsers();

  const filteredLogs = data?.logs?.filter(
    (log: any) =>
      log.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const deleteMutation = useDeletePettyCash();

  const confirmDelete = (id: string, amount: number) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ₹${amount} record? This will affect your balance.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* SUMMARY & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex items-end gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Range Start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
              Range End
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
            Total Outflow
          </p>
          <h2 className="text-3xl font-black italic">
            ₹{data?.totalAmount?.toLocaleString() || "0"}
          </h2>
        </div>
      </div>

      {/* SEARCH & ADD */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none shadow-sm"
            placeholder="Search by staff or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={16} /> Log Withdrawal
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Date
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Staff Member
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Reason
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs?.map((log: any) => (
              <tr
                key={log.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-8 py-5 text-xs font-bold text-slate-400">
                  {new Date(log.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-900 uppercase italic leading-none">
                    {log.user?.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                    {log.user?.role}
                  </p>
                </td>
                <td className="px-8 py-5 text-xs text-slate-600 font-medium italic">
                  "{log.reason}"
                </td>
                <td className="px-8 py-5 text-right flex items-center justify-end gap-4">
                  <span className="font-black text-red-600 text-base italic">
                    ₹{log.amount.toLocaleString()}
                  </span>

                  {/* DELETE BUTTON - VISIBLE ON HOVER */}
                  <button
                    onClick={() => confirmDelete(log.id, log.amount)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PettyCashModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
      />
    </div>
  );
}
