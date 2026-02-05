"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel, // Added for pagination
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
  Filter,
  RefreshCcw,
} from "lucide-react";
import StockInForm from "@/components/StockInForm";

export default function StockManagementPage() {
  const [items, setItems] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Date Range State
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const clearFilters = () => {
    setGlobalFilter("");
    setTypeFilter("ALL");
    setStartDate(today);
    setEndDate(today);
    toast.success("Filters Reset");
  };
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

  useEffect(() => {
    fetchInventory();
  }, [typeFilter, startDate, endDate]); // Refresh when filters change

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Category",
        cell: ({ row }) => (
          <div
            className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${row.original.type === "ALCOHOL" ? "text-purple-600" : "text-orange-600"}`}
          >
            {row.original.type === "ALCOHOL" ? (
              <Beer size={14} />
            ) : (
              <Utensils size={14} />
            )}
            {row.original.type}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Item Name",
        cell: (info) => (
          <span className="font-black text-gray-900 uppercase italic">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "stockQty",
        header: "Current Stock",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-black ${row.original.stockQty < 10 ? "text-red-600 animate-pulse" : "text-gray-900"}`}
            >
              {row.original.stockQty}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              {row.original.unit}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "lastPurchasePrice",
        header: "Last Purchase",
        cell: ({ row }) => (
          <span className="font-bold text-gray-900">
            ₹{row.original.lastPurchasePrice || 0}
          </span>
        ),
      },
      {
        accessorKey: "lastStockInDate",
        header: "Last Restock",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-gray-500">
            {row.original.lastStockInDate
              ? new Date(row.original.lastStockInDate).toLocaleDateString()
              : "N/A"}
          </span>
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
    initialState: { pagination: { pageSize: 8 } }, // Set default page size
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase text-gray-900">
              Inventory Feed
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              Real-time Resort Logistics
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-8 py-4 rounded-[20px] font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
          >
            <Plus size={18} /> Update Stock
          </button>
        </div>

        {/* FILTERS PANEL */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {["ALL", "FOOD", "ALCOHOL"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${typeFilter === t ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black focus:ring-0"
              />
              <span className="text-gray-400 text-[10px] font-black">TO</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black focus:ring-0"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="QUICK SEARCH..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-2xl font-bold text-xs focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
              >
                Clear
              </button>
              <button
                onClick={fetchInventory}
                className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
              >
                <RefreshCcw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
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
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-all">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-8 py-5">
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

          {/* PAGINATION CONTROLS */}
          <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase">
              Showing page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
