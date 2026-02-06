"use client";
import { Plus, Search, ArrowDownCircle } from "lucide-react";

export default function PettyCashTab() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <input
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            placeholder="Search cash logs..."
          />
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">
          <Plus size={14} /> Log Cash Withdrawal
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Staff Member
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-4 py-4 text-xs text-slate-500">
              Feb 07, 12:45 PM
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-slate-900">
              Rohan Das
            </td>
            <td className="px-4 py-4 text-xs text-slate-600 italic">
              Market Run: Fresh Vegetables
            </td>
            <td className="px-4 py-4">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase">
                Market
              </span>
            </td>
            <td className="px-4 py-4 text-right font-bold text-red-600">
              ₹1,500.00
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
