"use client";
import { useState } from "react";
import { usePerformanceReport } from "@/hooks/useReports";
import DateRangePicker from "@/components/DateRangePicker";
import {
  BarChart3,
  Receipt,
  IndianRupee,
  Star,
  ExternalLink,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import ItemDrilldownModal from "@/components/ItemDrilldownModal";

export default function PerformanceReport() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedDrilldown, setSelectedDrilldown] = useState<any>(null);
  // TanStack Query Hook replacing useEffect and local loading state
  const {
    data: report,
    isLoading,
    isFetching,
  } = usePerformanceReport(startDate, endDate);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* FILTERS & HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic leading-none">
                Revenue Intelligence
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                minizeo data analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isFetching && (
              <Loader2 className="animate-spin text-blue-600" size={18} />
            )}
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
              onClear={() => {
                setStartDate(today);
                setEndDate(today);
              }}
              onSubmit={() => {}} // Hook refetches automatically on date change
              loading={isLoading}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black italic text-gray-400 uppercase tracking-tighter">
              Analyzing minizeo Performance...
            </p>
          </div>
        ) : (
          report && (
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
                  value={`₹${(report?.avgOrderValue || 0).toFixed(2)}`}
                  icon={<Star />}
                  color="text-purple-600"
                />
              </div>

              {/* PERFORMANCE TABLE */}
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm italic">
                    Product Performance
                  </h3>
                  <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                    TOP {report.topSellingItems.length} ITEMS
                  </span>
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
                        onClick={() => setSelectedDrilldown(item)}
                        // onClick={() =>
                        //   toast(`Performance drilldown: ${item.name}`)
                        // }
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
              {selectedDrilldown && (
                <ItemDrilldownModal
                  itemId={selectedDrilldown.id}
                  itemName={selectedDrilldown.name}
                  startDate={startDate}
                  endDate={endDate}
                  onClose={() => setSelectedDrilldown(null)}
                />
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
      <div className={`p-3 w-fit rounded-2xl mb-4 bg-gray-50 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        {title}
      </p>
      <h2 className={`text-4xl font-black mt-2 tracking-tighter ${color}`}>
        {value}
      </h2>
    </div>
  );
}
