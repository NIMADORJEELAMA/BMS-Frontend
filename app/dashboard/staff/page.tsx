"use client";
import { useState } from "react";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import StaffModal from "@/components/staff/StaffModal";
import {
  Plus,
  Search,
  MoreHorizontal,
  UserCheck,
  Shield,
  ChefHat,
  User,
  Mail,
  Trash2,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StaffPage() {
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u: any) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Confirm permanent removal of ${name}?`)) {
      deleteUser.mutate(id, {
        onSuccess: () => toast.success("Employee removed from records"),
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Personnel Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage staff access levels and resort permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-xl">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Total Staff
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {users.length}
          </p>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-xl border-l-4 border-l-blue-500">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Active Now
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {users.filter((u: any) => u.isActive).length}
          </p>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Name & Identity
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Department / Role
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Account Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user: any) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.role === "ADMIN" ? (
                      <Shield size={14} className="text-indigo-500" />
                    ) : (
                      <User size={14} className="text-slate-400" />
                    )}
                    <span className="text-xs font-medium text-slate-700 uppercase tracking-tight">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-400"}`}
                    ></span>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && !isLoading && (
          <div className="py-20 text-center text-slate-400 text-sm">
            No matching personnel records found.
          </div>
        )}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={selectedUser}
      />
    </div>
  );
}
