"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/axios";
import OrderModal from "@/components/OrderModal";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  X,
  TrendingUp,
  Wallet,
  Clock,
  Calendar as CalendarIcon,
  FilterX,
} from "lucide-react";
import DateRangePicker from "@/components/DateRangePicker";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<any>();

export default function BillHistoryPage() {
  const [data, setData] = useState([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const getFormattedDate = (date: Date) => date.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Go back 7 days
    return getFormattedDate(d);
  });

  const [endDate, setEndDate] = useState(() => {
    return getFormattedDate(new Date()); // Today
  });
  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/history/bills", {
        params: {
          // Only send if there is a value
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBills();
  }, []);

  const handleSearch = () => {
    fetchBills(); // This is called by the DateRangePicker's submit button
  };
  const filteredData = useMemo(() => {
    return data.filter((bill: any) => {
      const billDate = new Date(bill.createdAt).toISOString().split("T")[0];
      if (startDate && billDate < startDate) return false;
      if (endDate && billDate > endDate) return false;
      return true;
    });
  }, [data, startDate, endDate]);
  // Summary Stats Logic
  const stats = useMemo(() => {
    const paidBills = data.filter((b: any) => b.status === "PAID");
    const totalRevenue = paidBills.reduce(
      (acc, b: any) => acc + Number(b.totalAmount),
      0,
    );
    const pendingCount = data.filter((b: any) => b.status === "BILLED").length;

    return { totalRevenue, pendingCount, totalOrders: data.length };
  }, [data]);

  // Table Column Definitions
  const columns = useMemo(
    () => [
      columnHelper.accessor("table.number", {
        header: "Table",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-black text-[10px]">
              {info.getValue()}
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
              Table {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("totalAmount", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount <ArrowUpDown size={12} />
          </button>
        ),
        // Force numeric sorting
        sortingFn: "basic",
        cell: (info) => (
          <span className="font-mono font-bold text-gray-900">
            ₹{Number(info.getValue()).toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                status === "PAID"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700 animate-pulse"
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor("paymentMode", {
        header: "Payment",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {info.getValue() === "CASH"
                ? "💵"
                : info.getValue() === "UPI"
                  ? "📱"
                  : "🧾"}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {info.getValue() || "Pending"}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Finalized At",
        cell: (info) => (
          <span className="text-xs text-gray-400 font-medium">
            {new Date(info.getValue()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">View</div>,
        cell: (info) => (
          <div className="text-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTable({
                  ...info.row.original.table,
                  activeOrder: info.row.original,
                });
              }}
              className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <Eye size={16} />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="p-8 bg-[#F8F9FC] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onClear={() => {
            setStartDate("");
            setEndDate("");
            // Optional: immediately fetch all if cleared
            setTimeout(fetchBills, 0);
          }}
          onSubmit={handleSearch} // Pass the submit function here
          loading={loading}
        />

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Revenue
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 mb-1">
              Total Paid Sales
            </p>
            <h2 className="text-3xl font-black text-gray-900">
              ₹{stats.totalRevenue}
            </h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Pending
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 mb-1">
              Unpaid Receipts
            </p>
            <h2 className="text-3xl font-black text-gray-900">
              {stats.pendingCount}
            </h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Wallet size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                Activity
              </span>
            </div>
            <p className="text-xs font-bold text-gray-500 mb-1">
              Total Transactions
            </p>
            <h2 className="text-3xl font-black text-gray-900">
              {stats.totalOrders}
            </h2>
          </div>
        </div>

        {/* TABLE HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
              size={18}
            />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by amount, table, or status..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* MAIN DATA GRID */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-gray-50/50 border-b border-gray-100"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-50">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() =>
                        setSelectedTable({
                          ...row.original.table,
                          activeOrder: row.original,
                        })
                      }
                      className="hover:bg-blue-50/20 transition-all cursor-pointer group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-8 py-5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-24 text-center">
                      <p className="text-gray-400 font-medium italic">
                        No transactions found matching your search.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
        </div>
      </div>

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onRefresh={fetchBills}
        />
      )}
    </div>
  );
}
