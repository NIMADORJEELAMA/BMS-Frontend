"use client";

import { useState, useMemo, useEffect } from "react";
import { usePerformanceReport } from "@/hooks/useReports";
import { BarChart3, Receipt, IndianRupee, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// UI Components
import { DatePicker, Card, Statistic, Spin } from "antd";
import { SearchBar } from "@/components/ui/SearchBar"; // Assuming path
import { AgGridReact } from "ag-grid-react";
import "@/lib/agGrid";

import dayjs from "dayjs";
import { ColDef } from "ag-grid-community";

const { RangePicker } = DatePicker;

export default function EnterprisePerformanceReport() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs(),
    dayjs(),
  ]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const startDate = dateRange[0].format("YYYY-MM-DD");
  const endDate = dateRange[1].format("YYYY-MM-DD");

  const { data: report, isLoading } = usePerformanceReport(
    startDate,
    endDate,
    1,
    1000,
    debouncedSearch,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "No",
        // In AG Grid 31.x+, 'node.rowIndex' is common,
        // but ensure params are used for best practice
        valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
        width: 70,
        pinned: "left",
        suppressMovable: true, // Recommended for a rank column
        cellRenderer: (params: any) => (
          <span className="font-bold text-slate-700">{params.value}</span>
        ),
      },
      {
        field: "name",
        headerName: "Product",
        flex: 1,
        filter: "agTextColumnFilter",
        cellRenderer: (params: any) => (
          <span className="font-bold text-slate-700">{params.value}</span>
        ),
      },
      {
        field: "quantity",
        headerName: "Sold",
        width: 150,
        sortable: true,
        cellRenderer: (params: any) => (
          <span className="font-bold text-slate-700">{params.value}</span>
        ),
      },
    ],
    [],
  );
  return (
    <div className=" bg-[#f8fafc] p-4">
      <div className="mx-auto space-y-4">
        {/* COMPACT HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 ">
          <SearchBar
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-3 justify-between">
            <RangePicker
              value={dateRange}
              onChange={(values) =>
                values && setDateRange([values[0]!, values[1]!])
              }
              className="rounded-xl h-12 border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* SQUARE KPI GRID - Left Side (4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <KPICard
              title="Revenue"
              value={report?.totalRevenue || 0}
              prefix="₹"
              icon={<IndianRupee size={16} />}
              color="indigo"
            />
            <KPICard
              title="Orders"
              value={report?.orderCount || 0}
              icon={<Receipt size={16} />}
              color="emerald"
            />
            <KPICard
              title="Avg Ticket"
              value={report?.avgOrderValue || 0}
              prefix="₹"
              precision={1}
              icon={<TrendingUp size={16} />}
              color="orange"
            />
            <div className="bg-indigo-600 rounded-2xl p-4 text-white flex flex-col justify-center shadow-lg shadow-indigo-100">
              <p className="text-xs opacity-80">Top Item</p>
              <p className="font-bold truncate text-sm">
                {report?.topSellingItems?.[0]?.name || "N/A"}
              </p>
            </div>
          </div>

          {/* COMPACT CHART - Right Side (8 cols) */}
          <Card
            title={<span className="text-sm font-bold">Top 5 Items</span>}
            className="lg:col-span-8 shadow-sm rounded-2xl border-slate-200"
            styles={{ body: { padding: "12px" } }}
          >
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={report?.topSellingItems?.slice(0, 5)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis dataKey="name" hide />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="quantity"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AG GRID TABLE */}
        <Card
          styles={{ body: { padding: 0 } }}
          className="shadow-sm rounded-2xl border-slate-200 overflow-hidden"
        >
          <div
            className="ag-theme-quartz enterprise-grid"
            style={{ height: "55vh", width: "100%" }}
          >
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Spin />
              </div>
            ) : (
              <AgGridReact
                rowData={report?.topSellingItems || []}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={20}
                defaultColDef={{ resizable: true, sortable: true }}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  prefix = "",
  color,
  precision = 0,
}: any) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card
      className="border-slate-200 rounded-[6rem] shadow-sm overflow-hidden"
      styles={{ body: { padding: "16px" } }}
    >
      <div
        className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center mb-2`}
      >
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
        {title}
      </p>
      <Statistic
        value={value}
        prefix={prefix}
        precision={precision}
        styles={{
          content: { fontWeight: 800, color: "#1e293b", fontSize: "1.1rem" },
        }}
      />
    </Card>
  );
}
