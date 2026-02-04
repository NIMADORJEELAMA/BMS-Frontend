"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import DateRangePicker from "@/components/DateRangePicker";
import {
  BarChart3,
  Receipt,
  IndianRupee,
  Star,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PerformanceReport() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/reports/performance", {
        params: { startDate, endDate },
      });
      setReport(res.data);
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomReport();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">
              Revenue Intelligence
            </h1>
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={() => {
              setStartDate(today);
              setEndDate(today);
            }}
            onSubmit={fetchCustomReport}
            loading={loading}
          />
        </div>

        {report && (
          <>
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReportCard
                title="Total Revenue"
                value={`₹${report.totalRevenue}`}
                icon={<IndianRupee />}
                color="text-green-600"
              />
              <ReportCard
                title="Total Orders"
                value={report.orderCount}
                icon={<Receipt />}
                color="text-blue-600"
              />
              <ReportCard
                title="Avg. Ticket Size"
                // Added '?' and a fallback to 0
                value={`₹${(report?.avgOrderValue || 0).toFixed(2)}`}
                icon={<Star />}
                color="text-purple-600"
              />
            </div>

            {/* PERFORMANCE TABLE */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">
                  Product Performance
                </h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Rank</th>
                    <th className="px-8 py-4">Dish Name</th>
                    <th className="px-8 py-4">Qty Sold</th>
                    <th className="px-8 py-4 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.topSellingItems.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/20 transition-all cursor-pointer group"
                      onClick={() =>
                        toast(`Viewing drilldown for ${item.name}...`)
                      }
                    >
                      <td className="px-8 py-5">
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black ${
                            index < 3
                              ? "bg-amber-100 text-amber-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-gray-900 uppercase text-sm tracking-tight">
                        {item.name}
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
      <div className={`p-3 w-fit rounded-2xl mb-4 bg-gray-50 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        {title}
      </p>
      <h2 className={`text-4xl font-black mt-2 ${color}`}>{value}</h2>
    </div>
  );
}
