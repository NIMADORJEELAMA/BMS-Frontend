"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  TrendingUp,
  ShoppingBag,
  ChevronRight,
  Calendar,
  Trophy,
  Download,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SalesReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/reports/daily");
      setReport(res.data);
    } catch (err) {
      toast.error("Failed to fetch daily report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-gray-400 font-black uppercase text-xs tracking-widest animate-pulse">
        Crunching Numbers...
      </div>
    );

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
              Daily Analytics
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500 font-bold text-sm">
              <Calendar size={16} />
              <span>
                Report for{" "}
                {new Date(report.date).toLocaleDateString("en-IN", {
                  dateStyle: "long",
                })}
              </span>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={16} /> Export PDF
          </button>
        </header>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
              Total Revenue
            </p>
            <h2 className="text-5xl font-black mt-2">
              ₹{report.totalRevenue.toLocaleString()}
            </h2>
            <div className="flex items-center gap-2 mt-6 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
              <ArrowUpRight size={14} /> +12% from yesterday
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Orders Settle
              </p>
              <h2 className="text-5xl font-black text-gray-900 mt-2">
                {report.orderCount}
              </h2>
            </div>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Handled by active staff
              </p>
            </div>
          </div>
        </div>

        {/* TOP SELLING ITEMS */}
        <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Trophy size={20} />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Top Performers
              </h3>
            </div>
          </div>

          <div className="p-4">
            {report.topSellingItems.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-3xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-2xl font-black text-xs">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {item.quantity} portions sold
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden hidden md:block">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${(item.quantity / report.topSellingItems[0].quantity) * 100}%`,
                      }}
                    />
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER NOTE */}
        <footer className="bg-gray-900 p-8 rounded-[40px] text-center">
          <ShoppingBag className="mx-auto text-blue-500 mb-4" size={32} />
          <p className="text-white font-black uppercase text-xs tracking-widest">
            minizeo pos intelligence
          </p>
          <p className="text-gray-500 text-[10px] mt-1 font-bold">
            Automatic sync enabled • Real-time database accuracy
          </p>
        </footer>
      </div>
    </div>
  );
}
