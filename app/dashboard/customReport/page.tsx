"use client";

import { useState, useMemo, useEffect } from "react";
import { usePerformanceReport } from "@/hooks/useReports";
import {
  BarChart3,
  Receipt,
  IndianRupee,
  TrendingUp,
  Loader2,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import DoubleDateRangePicker from "@/components/DoubleDateRangePicker";

export default function EnterprisePerformanceReport() {
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Reset page when date changes
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const {
    data: report,
    isLoading,
    isFetching,
  } = usePerformanceReport(startDate, endDate, page, limit, debouncedSearch);
  const totalPages = Math.max(1, Math.ceil((report?.totalItems || 0) / limit));

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 2;

    const start = Math.max(1, page - windowSize);
    const end = Math.min(totalPages, page + windowSize);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  // const totalPages = useMemo(() => {
  //   if (!report?.totalItems) return 1;
  //   return Math.ceil(report.totalItems / limit);
  // }, [report, limit]);

  const revenueTrendData = useMemo(() => {
    return (
      report?.dailyRevenue?.map((d: any) => ({
        date: d.date,
        revenue: d.total,
      })) || []
    );
  }, [report]);

  const topItemsChartData = useMemo(() => {
    return report?.topSellingItems?.slice(0, 5) || [];
  }, [report]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="  mx-auto space-y-8">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Performance Analytics
              </h1>
              <p className="text-sm text-slate-500">
                Revenue & Product Insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DoubleDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
        </div>

        {/* KPI SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPI
            title="Total Revenue"
            value={`₹${report?.totalRevenue || 0}`}
            icon={<IndianRupee />}
          />
          <KPI
            title="Total Orders"
            value={report?.orderCount || 0}
            icon={<Receipt />}
          />
          <KPI
            title="Avg Order Value"
            value={`₹${(report?.avgOrderValue || 0).toFixed(2)}`}
            icon={<TrendingUp />}
          />
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600 mb-4">
              Top Selling Items
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItemsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <span className="text-xs text-slate-500">
            {report?.totalItems || 0} Records
          </span>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">
              Product Performance
            </h3>
            <span className="text-xs text-slate-500">
              {report?.totalItems === 0 ? (
                "No records found"
              ) : (
                <>
                  Showing {(page - 1) * limit + 1}–
                  {Math.min(page * limit, report?.totalItems || 0)} of{" "}
                  {report?.totalItems} records
                </>
              )}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.topSellingItems.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium">
                      #{(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 border rounded ${
                    page === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : ""
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          {page < totalPages - 2 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => setPage(totalPages)}
                className="px-3 py-1 border rounded"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>
      <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  );
}
