"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Banknote,
  ReceiptText,
  ChevronRight,
  Printer,
  CheckCircle2,
} from "lucide-react";

export default function PayrollTab() {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: payroll = [], isLoading } = useQuery({
    queryKey: ["payroll", year, month],
    queryFn: async () => {
      const { data } = await api.get(`/operations/payroll`, {
        params: { year, month },
      });
      return data;
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* PAYROLL SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
          <p className="text-[10px] font-black uppercase text-slate-400">
            Total Disbursements
          </p>
          <h3 className="text-2xl font-black   text-slate-900 mt-1">
            ₹
            {payroll
              .reduce((sum: any, p: any) => sum + p.netPay, 0)
              .toLocaleString()}
          </h3>
        </div>
        <div className="bg-red-50 p-6 rounded-[24px] border border-red-100">
          <p className="text-[10px] font-black uppercase text-red-400">
            Total Advances Deducted
          </p>
          <h3 className="text-2xl font-black   text-red-600 mt-1">
            ₹
            {payroll
              .reduce((sum: any, p: any) => sum + p.totalAdvances, 0)
              .toLocaleString()}
          </h3>
        </div>
      </div>

      {/* PAYROLL TABLE */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Employee
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Attendance
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Gross Pay
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-red-400 uppercase tracking-widest">
                Advances
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Net Payout
              </th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payroll.map((p: any) => (
              <tr
                key={p.userId}
                className="hover:bg-slate-50/50 transition-all group"
              >
                <td className="px-8 py-5">
                  <p className="font-black text-slate-900 uppercase text-xs">
                    {p.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    {p.role}
                  </p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold text-slate-600">
                    {p.presentDays} Days
                  </span>
                </td>
                <td className="px-8 py-5 text-xs font-medium text-slate-500">
                  ₹{p.grossPay.toLocaleString()}
                </td>
                <td className="px-8 py-5 text-xs font-black text-red-500">
                  - ₹{p.totalAdvances.toLocaleString()}
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-black text-emerald-600">
                    ₹{p.netPay.toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                    <ReceiptText size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
