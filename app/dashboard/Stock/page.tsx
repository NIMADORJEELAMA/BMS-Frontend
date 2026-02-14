"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Beer,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCcw,
  AlertCircle,
  TrendingUp,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import StockInForm from "@/components/StockInForm";
import InventoryAnalytics from "@/components/Stocks/InventoryAnalytics";

export default function StockManagementPage() {
  const [items, setItems] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory/stocks", {
        params: {
          type: typeFilter === "ALL" ? undefined : typeFilter,
          startDate,
          endDate,
        },
      });
      setItems(res.data);
    } catch (err) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };
  const analyticsData = useMemo(() => {
    if (!items || items.length === 0) return null;
    // Since stats are repeated in each item, we grab it from the first index
    return items[0]?.stats;
  }, [items]);
  const handleResetFilters = () => {
    // 1. Reset Category
    setTypeFilter("ALL");

    // 2. Reset Search (both buffer and active filter)
    setGlobalFilter("");
    // setSearchBuffer(""); // If you're using the debounce buffer

    // 3. Reset Dates (Clear both temp and query states)
    setStartDate("");
    setEndDate("");

    // 4. Trigger the fetch/refresh logic
    // If your fetchInventory relies on these states,
    // ensure it runs after they are cleared.
    toast.success("Filters Cleared");
  };
  useEffect(() => {
    fetchInventory();
  }, [typeFilter, startDate, endDate]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Asset Detail",
        cell: (info: any) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight uppercase">
              {info.getValue()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              SKU-{info.row.original.id.split("-")[0]}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Category",
        cell: ({ row }: any) => {
          const isAlcohol = row.original.type === "ALCOHOL";
          return (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${
                isAlcohol
                  ? "bg-purple-50 text-purple-700 border-purple-100"
                  : "bg-orange-50 text-orange-700 border-orange-100"
              }`}
            >
              {isAlcohol ? <Beer size={12} /> : <Utensils size={12} />}
              {row.original.type}
            </div>
          );
        },
      },
      {
        accessorKey: "currentStock",
        header: "Stock Level",
        cell: ({ row }: any) => {
          const qty = row.original.currentStock;
          const status = qty < 10 ? "LOW" : qty < 30 ? "MID" : "HEALTHY";
          return (
            <div className="flex flex-col gap-2 min-w-[140px]">
              <div className="flex justify-between items-end">
                <span
                  className={`text-sm font-black ${status === "LOW" ? "text-red-600" : "text-slate-900"}`}
                >
                  {qty}{" "}
                  <span className="text-[10px] text-slate-400 font-bold">
                    {row.original.unit}
                  </span>
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    status === "LOW"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {status}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${status === "LOW" ? "bg-red-500" : status === "MID" ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min((qty / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "lastPurchasePrice",
        header: "Stock Price",
        cell: ({ row }: any) => (
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900">
              ₹{row.original.lastPurchasePrice.toLocaleString()}
            </span>
            {/* <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              Stock Asset Value
            </span> */}
          </div>
        ),
      },
      {
        id: "valuation",
        header: "Equity Value",
        cell: ({ row }: any) => (
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900">
              ₹
              {(
                row.original.currentStock * row.original.lastPurchasePrice
              ).toLocaleString()}
            </span>
            {/* <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              Current Asset Value
            </span> */}
          </div>
        ),
      },
      {
        accessorKey: "lastStockInDate",
        header: "Last Restock",
        cell: ({ row }: any) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700">
              {row.original.lastStockInDate
                ? new Date(row.original.lastStockInDate).toLocaleDateString()
                : "No Activity"}
            </span>
            {/* <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Last Restocked
            </span> */}
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen text-slate-900 font-sans">
      <div className="  mx-auto space-y-8">
        {/* ENTERPRISE HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
                <Package size={22} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Stock{" "}
                <span className="text-slate-400 font-medium ">Dashboard</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">
              Resort Stock Management & Real-time Stock Logistics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white cursor-pointer px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              <Plus size={18} /> Add New Inventory
            </button>
          </div>
        </div>

        {/* inventory analytics */}

        {analyticsData && <InventoryAnalytics stats={analyticsData} />}

        {/* CONTROL CENTER */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="FILTER BY ITEM NAME OR SKU..."
              className="w-[360px] pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-slate-900 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl w-full lg:w-auto">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black outline-none focus:ring-0"
            />
            <ArrowRight size={12} className="text-slate-300" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black outline-none focus:ring-0"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl w-full lg:w-auto">
            {["ALL", "FOOD", "ALCOHOL"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 lg:px-8 py-2.5 rounded-xl text-[10px] font-black transition-all ${typeFilter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetFilters}
            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-10 py-6">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Audit Trail: {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()} Pages
            </p>
            <div className="flex gap-3">
              <button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:shadow-md transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:shadow-md transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL OVERLAY */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <StockInForm
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                fetchInventory();
                setIsModalOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
