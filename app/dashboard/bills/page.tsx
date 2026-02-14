"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
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
  Download,
  RotateCcw,
} from "lucide-react";
import DateRangePicker from "@/components/DateRangePicker";
import DatePicker from "@/components/DateRangePicker";
import BillReceiptModal from "@/components/Bills/BillReceiptModal";

const columnHelper = createColumnHelper<any>();

export default function BillHistoryPage() {
  const getFormattedDate = (date: Date) => date.toISOString().split("T")[0];
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  // 1. Optimized Date State
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getFormattedDate(d);
  });
  const [endDate, setEndDate] = useState(() => getFormattedDate(new Date()));
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);

  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [tempStart, setTempStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return formatDate(d);
  });

  const [tempEnd, setTempEnd] = useState(() => formatDate(new Date()));
  const [searchBuffer, setSearchBuffer] = useState("");

  // 2. This is the state the table actually uses to filter
  const [globalFilter, setGlobalFilter] = useState("");
  // 3. Debounce Effect: Wait 300ms after the user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalFilter(searchBuffer);
    }, 300); // 300ms is the "sweet spot" for enterprise search

    return () => clearTimeout(handler);
  }, [searchBuffer]);
  // 2. "Active" states (The actual query parameters)
  const [queryDates, setQueryDates] = useState({
    start: tempStart,
    end: tempEnd,
  });
  // 2. Data Fetching
  const { data, isLoading, isFetching } = useBillHistory(
    queryDates.start,
    queryDates.end,
  );
  const applyFilters = () => {
    // Only fetch when the user is ready
    setQueryDates({ start: tempStart, end: tempEnd });
  };

  const resetToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setTempStart(today);
    setTempEnd(today);
    setQueryDates({ start: today, end: today });
  };
  // const {
  //   data = [],
  //   isLoading,
  //   isFetching,
  // } = useBillHistory(startDate, endDate);

  // 3. Memoized Filtering to prevent crashes on large datasets
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (statusFilter === "ALL") return data;
    return data.filter((bill: any) => bill.status === statusFilter);
  }, [data, statusFilter]);

  // 4. Memoized Stats
  const stats = useMemo(() => {
    // Ensure data exists before iterating
    const currentData = Array.isArray(data) ? data : [];

    let totalRevenue = 0;
    let pendingCount = 0;

    // Now this won't crash because currentData is at least []
    for (const b of currentData) {
      if (b.status === "PAID") totalRevenue += Number(b.totalAmount || 0);
      if (b.status === "BILLED") pendingCount++;
    }

    return { totalRevenue, pendingCount, totalOrders: currentData.length };
  }, [data]);
  // const stats = useMemo(() => {
  //   let totalRevenue = 0;
  //   let pendingCount = 0;

  //   for (const b of data) {
  //     if (b.status === "PAID") totalRevenue += Number(b.totalAmount || 0);
  //     if (b.status === "BILLED") pendingCount++;
  //   }

  //   return { totalRevenue, pendingCount, totalOrders: data.length };
  // }, [data]);

  // 5. Optimized Column Definitions
  const columns = useMemo(
    () => [
      columnHelper.accessor("table.number", {
        header: "Table Name",
        cell: (info) => (
          <div className="flex items-center gap-3">
            {/* <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-200">
              {info.getValue()}
            </div> */}
            <span className="text-sm  font-bold text-slate-700 ">
              Table {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("totalAmount", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting()}
          >
            Amount <ArrowUpDown size={14} />
          </button>
        ),
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">
              ₹{Number(info.getValue()).toLocaleString()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const style =
            status === "PAID"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-amber-50 text-amber-700 border-amber-100";
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${style}`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor("paymentMode", {
        header: "Method",
        cell: (info) => (
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {info.getValue() || "Pending"}
          </span>
        ),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Finalized At",
        cell: (info) => (
          <div className="text-xs text-slate-600">
            {new Date(info.getValue()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">View</div>,
        cell: (info) => (
          <div className="text-right">
            <button
              onClick={() => setSelectedBill(info.row.original)} // Set the full bill data
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 cursor-pointer"
            >
              <Eye size={18} />
            </button>
          </div>
        ),
      }),
      // columnHelper.display({
      //   id: "actions",
      //   header: () => <div className="text-right">View</div>,
      //   cell: (info) => (
      //     <div className="text-right">
      //       <button
      //         onClick={() =>
      //           setSelectedTable({
      //             ...info.row.original.table,
      //             activeOrder: info.row.original,
      //           })
      //         }
      //         className="p-2 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
      //       >
      //         <Eye size={18} />
      //       </button>
      //     </div>
      //   ),
      // }),
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
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
    <div className=" mx-auto p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Bill Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">
            Finance • Bill History
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full cursor-pointer">
                <DatePicker
                  label="Start Date"
                  value={tempStart}
                  onChange={setTempStart}
                />
                <DatePicker
                  label="End Date"
                  value={tempEnd}
                  onChange={setTempEnd}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetToToday}
                  className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                  title="Reset"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={applyFilters}
                  disabled={isFetching}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isFetching ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                  Update Records
                </button>
              </div>
            </div>
          </div>
          {isFetching && (
            <Loader2 className="animate-spin text-blue-600" size={18} />
          )}
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Gross Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          dark
        />
        <StatCard
          label="Billed (Pending)"
          value={stats.pendingCount}
          icon={<Wallet size={20} />}
        />
        <StatCard
          label="Total Transactions"
          value={stats.totalOrders}
          icon={<Clock size={20} />}
        />
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            value={searchBuffer} // Bind to buffer
            onChange={(e) => setSearchBuffer(e.target.value)} // Update buffer instantly
            placeholder="Search Table or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {["ALL", "PAID", "BILLED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold tracking-widest ${
                statusFilter === s
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-slate-50 border-b border-slate-200"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"
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
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
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
                  <td colSpan={10} className="py-20 text-center text-slate-400">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 bg-white border border-slate-200 rounded-md disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 bg-white border border-slate-200 rounded-md disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onRefresh={() => {}}
        />
      )}
      {selectedBill && (
        <BillReceiptModal
          order={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, dark = false }: any) {
  return (
    <div
      className={`p-6 rounded-2xl border ${dark ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-900 border-slate-200 shadow-sm"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <p
          className={`text-[10px] font-black uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-500"}`}
        >
          {label}
        </p>
        <span className={dark ? "text-blue-400" : "text-slate-400"}>
          {icon}
        </span>
      </div>
      <h2 className="text-3xl font-black tracking-tight">{value}</h2>
    </div>
  );
}
