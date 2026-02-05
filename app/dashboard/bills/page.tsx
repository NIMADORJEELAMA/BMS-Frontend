"use client";
import { useState, useMemo } from "react";
import { useBillHistory } from "@/hooks/useHistory";
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
  TrendingUp,
  Wallet,
  Clock,
  FilterX,
  Loader2,
} from "lucide-react";
import DateRangePicker from "@/components/DateRangePicker";

const columnHelper = createColumnHelper<any>();

export default function BillHistoryPage() {
  const getFormattedDate = (date: Date) => date.toISOString().split("T")[0];

  // 1. Local state for Date Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getFormattedDate(d);
  });
  const [endDate, setEndDate] = useState(() => getFormattedDate(new Date()));

  // 2. TanStack Query Hook
  const {
    data = [],
    isLoading,
    isFetching,
  } = useBillHistory(startDate, endDate);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedTable, setSelectedTable] = useState<any>(null);

  // 3. Stats Calculation (now uses 'data' from Query)
  const stats = useMemo(() => {
    const paidBills = data.filter((b: any) => b.status === "PAID");
    const totalRevenue = paidBills.reduce(
      (acc, b: any) => acc + Number(b.totalAmount),
      0,
    );
    const pendingCount = data.filter((b: any) => b.status === "BILLED").length;
    return { totalRevenue, pendingCount, totalOrders: data.length };
  }, [data]);

  // 4. Columns Definition (Same as your original)
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
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700 animate-pulse"}`}
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
    data,
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
    <div className="max-w-[1400px] mx-auto p-6 space-y-8 min-h-screen bg-white">
      {/* Header & Date Picker */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900">
            Revenue Logs
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
            minizeo resort • Financial Records
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onSubmit={() => {}} // Query handles this automatically on date change
          />
          {isFetching && (
            <Loader2 className="animate-spin text-blue-600" size={20} />
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-8 rounded-[40px] text-white">
          <TrendingUp className="text-blue-400 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
            Total Revenue
          </p>
          <h2 className="text-4xl font-black italic">
            ₹{stats.totalRevenue.toLocaleString()}
          </h2>
        </div>
        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
          <Wallet className="text-amber-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Pending Bills
          </p>
          <h2 className="text-4xl font-black italic text-gray-900">
            {stats.pendingCount}
          </h2>
        </div>
        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
          <Clock className="text-gray-400 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Total Orders
          </p>
          <h2 className="text-4xl font-black italic text-gray-900">
            {stats.totalOrders}
          </h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="SEARCH BY TABLE, AMOUNT, OR STATUS..."
          className="w-full pl-16 pr-8 py-6 bg-gray-50 rounded-[30px] border-none font-black uppercase text-xs tracking-widest focus:ring-2 focus:ring-gray-900 transition-all text-black"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-gray-200" size={40} />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              Compiling Records...
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"
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
            <tbody className="divide-y divide-gray-50 text-black">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-all">
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
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Showing Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-4 bg-gray-50 rounded-2xl disabled:opacity-20 hover:bg-gray-100 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-4 bg-gray-50 rounded-2xl disabled:opacity-20 hover:bg-gray-100 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onRefresh={() => {}} // Read-only view
        />
      )}
    </div>
  );
}
