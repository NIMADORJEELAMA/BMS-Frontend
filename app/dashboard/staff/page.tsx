// app/dashboard/staff/page.tsx
"use client";
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import StaffModal from "@/components/staff/StaffModal";
import { Pencil, UserPlus, Loader2 } from "lucide-react";

export default function StaffPage() {
  const { data: users = [], isLoading } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900">
            Personnel
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
            minizeo resort • Access Control
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition flex items-center gap-2"
        >
          <UserPlus size={16} /> Add Member
        </button>
      </header>

      {/* STAFF TABLE */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          {/* ... thead is same as before ... */}
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50/50 group">
                <td className="px-10 py-6 font-black uppercase italic text-gray-900">
                  {user.name}
                </td>
                {/* ... other cells ... */}
                <td className="px-10 py-6 text-right">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={selectedUser}
      />
    </div>
  );
}
