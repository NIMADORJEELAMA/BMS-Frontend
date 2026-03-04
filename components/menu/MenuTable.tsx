"use client";

import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "@/lib/agGrid";

import { Pencil, Trash2, Search } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: "FOOD" | "ALCOHOL";
  isVeg: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Props {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export default function EnterpriseMenuTable({
  items,
  onEdit,
  onDelete,
}: Props) {
  const gridRef = useRef<AgGridReactType>(null);
  const [quickFilter, setQuickFilter] = useState("");

  /* ================= COLUMN DEFINITIONS ================= */

  const columnDefs = useMemo<ColDef<MenuItem>[]>(
    () => [
      {
        headerName: "Item",
        field: "name",
        flex: 1.8,
        cellStyle: (params) =>
          params.node.isRowPinned()
            ? { fontWeight: "bold", fontSize: "14px" }
            : null,
        cellRenderer: (params) => {
          if (params.node.isRowPinned()) return params.value;

          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                {params.data?.name}
              </span>
              <span className="text-xs text-slate-400">
                {params.data?.category}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Type",
        field: "type",
        width: 130,
        // filter: "agSetColumnFilter",
        cellRenderer: (params) => (
          <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Created On",
        field: "createdAt",
        width: 150,
        // filter: "agDateColumnFilter",
        valueFormatter: (params) =>
          params.value
            ? new Date(params.value).toLocaleDateString("en-GB")
            : "",
      },
      {
        headerName: "Status",
        field: "isActive",
        width: 140,
        // filter: "agSetColumnFilter",
        cellRenderer: (params) => (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded ${
              params.value
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {params.value ? "Active" : "Disabled"}
          </span>
        ),
      },
      {
        headerName: "Price",
        field: "price",
        width: 160,
        // filter: "agNumberColumnFilter",
        cellClass: (params) =>
          params.node.isRowPinned()
            ? "text-right font-black text-emerald-800 bg-emerald-100"
            : "text-right font-semibold text-slate-900",
        valueFormatter: (params) =>
          params.value ? `₹${params.value.toLocaleString()}` : "",
      },
      {
        headerName: "Actions",
        field: "id",
        width: 110,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          if (params.node.isRowPinned()) return null;

          return (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => onEdit(params.data!)}
                className="p-1.5 rounded hover:bg-slate-100"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(params.data!)}
                className="p-1.5 rounded text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete],
  );

  /* ================= DEFAULT COLUMN ================= */

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: true,
      resizable: true,
    }),
    [],
  );

  /* ================= PINNED TOTAL ROW ================= */

  const pinnedBottomRowData = useMemo(() => {
    if (!items.length) return [];

    return [
      {
        name: "TOTALS",
        price: items.reduce((sum, item) => sum + (item.price || 0), 0),
        type: "",
        createdAt: "",
        isActive: "",
      },
    ];
  }, [items]);

  /* ================= RENDER ================= */

  return (
    <div className="space-y-4">
      {/* SEARCH BAR */}
      <div className="flex justify-between items-center bg-white border border-slate-200 px-4 py-3">
        <div className="relative w-80">
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={quickFilter}
            onChange={(e) => {
              setQuickFilter(e.target.value);
              gridRef.current?.api.setGridOption(
                "quickFilterText",
                e.target.value,
              );
            }}
            placeholder="Search menu items..."
            className="pl-8 pr-3 py-2 border border-slate-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* GRID */}
      <div
        className="ag-theme-quartz enterprise-grid"
        style={{ height: 600, width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={items}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={20}
          animateRows
          rowSelection="single"
          pinnedBottomRowData={pinnedBottomRowData}
        />
      </div>
    </div>
  );
}
