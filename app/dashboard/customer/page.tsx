"use client";

import { useState, useMemo } from "react";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";

import {
  Plus,
  Shield,
  User,
  Trash2,
  Edit3,
  Settings2,
  UserIcon,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/SearchBar";
import { useRouter } from "next/navigation";
// AG Grid Imports
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "@/lib/agGrid";
import Router from "next/router";
import CustomerModal from "./CustomerModal";
import { Popconfirm } from "antd";

export default function CustomerPage() {
  const router = useRouter();
  const { data: users = [], isLoading } = useCustomers();
  console.log("users", users);
  const deleteUser = useDeleteCustomer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  console.log("selectedUser qq", selectedUser);

  const handleDelete = (id: string, name: string) => {
    // The Popconfirm already handles the confirmation UI
    deleteUser.mutate(id, {
      onSuccess: () => toast.success(`${name} removed from records`),
      onError: (err: any) => {
        const message =
          err?.response?.data?.message || "Failed to remove record";
        toast.error(message);
      },
    });
  };

  // AG Grid Column Definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Customer",
        field: "name",

        cellRenderer: (params: any) => (
          <div className="flex items-center gap-3 h-full">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 text-[10px] uppercase">
              {params.data.name?.charAt(0) || "C"}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                {params.data.name}
              </p>
            </div>
          </div>
        ),
      },
      {
        headerName: "Email",
        field: "email",

        cellRenderer: (params: any) => (
          <div className="flex items-center gap-3 h-full">
            <div className="leading-tight">
              <p className="text-[14px] text-slate-800">
                {params.data.email || "No Email"}
              </p>
            </div>
          </div>
        ),
      },
      {
        headerName: "Phone Number",
        field: "phone",
        width: 300,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-2 h-full text-sm font-medium text-slate-700">
            {params.value}
          </div>
        ),
      },
      {
        headerName: "Loyalty",
        field: "loyaltyPoints",
        width: 200,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-2 h-full">
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-[10px] font-bold">
              {params.value} PTS
            </span>
          </div>
        ),
      },
      {
        headerName: "Actions",
        field: "id",
        width: 120,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: (params: any) => (
          console.log("params", params),
          (
            <div className="flex justify-center items-center gap-1 h-full">
              <button
                onClick={() =>
                  router.push(`/dashboard/customer/${params.data.id}`)
                }
                className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md"
              >
                <UserIcon size={15} />
              </button>
              <button
                onClick={() => {
                  setSelectedUser(params.data);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:  rounded-md transition-all cursor-pointer"
              >
                <Edit3 size={15} />
              </button>
              <Popconfirm
                title="Delete record?"
                onConfirm={() => handleDelete(params.data.id, params.data.name)}
                okButtonProps={{ danger: true }}
              >
                <button className="flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-all h-full cursor-pointer">
                  <Trash2 size={18} />
                </button>
              </Popconfirm>
              <button
                onClick={() => handleDelete(params.data.id, params.data.name)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover: rounded-md transition-all cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    [],
  );

  return (
    <div className="space-y-6 p-6 bg-[#fcfcfd] min-h-screen">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div></div>
        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Quick search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="terminal"
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            Add Customer
          </Button>
        </div>
      </div>

      {/* AG GRID TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="ag-theme-quartz w-full h-[600px]">
          <AgGridReact
            rowData={users}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={search}
            pagination={true}
            paginationPageSize={20}
            animateRows={true}
            rowHeight={56}
            headerHeight={48}
          />
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCustomer={selectedUser}
      />
    </div>
  );
}

function StatsCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div
      className={`bg-white p-4 border border-slate-200 rounded-xl ${color === "blue" ? "border-l-4 border-l-blue-500" : ""}`}
    >
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
        {title}
      </p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
