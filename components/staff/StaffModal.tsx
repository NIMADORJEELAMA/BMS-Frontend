"use client";
import { useState, useEffect } from "react";
import { useRegisterUser, useUpdateUser } from "@/hooks/useUsers";
import { X, Loader2, UserPlus, Save } from "lucide-react";
import toast from "react-hot-toast";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: any; // If present, we are in Edit Mode
}

export default function StaffModal({
  isOpen,
  onClose,
  editingUser,
}: StaffModalProps) {
  const register = useRegisterUser();
  const update = useUpdateUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "WAITER",
  });

  // Sync form when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name,
        email: editingUser.email,
        password: "", // Leave blank for security during edit
        role: editingUser.role,
      });
    } else {
      setForm({ name: "", email: "", password: "", role: "WAITER" });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // EDIT MODE
      const updateData = { ...form };
      if (!updateData.password) delete (updateData as any).password; // Don't send empty password

      update.mutate(
        { id: editingUser.id, data: updateData },
        {
          onSuccess: () => {
            toast.success("Staff details updated!");
            onClose();
          },
          onError: (err: any) =>
            toast.error(err.response?.data?.message || "Update failed"),
        },
      );
    } else {
      // REGISTER MODE
      register.mutate(form, {
        onSuccess: () => {
          toast.success(`${form.name} registered!`);
          onClose();
        },
        onError: (err: any) =>
          toast.error(err.response?.data?.message || "Registration failed"),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
              Personnel Management
            </p>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {editingUser ? `Edit: ${editingUser.name}` : "Register New Staff"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5"
          autoComplete="off"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Full Name
              </label>
              <input
                className="px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm text-black focus:ring-2 focus:ring-gray-900"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Email Address
              </label>
              <input
                type="email"
                className="px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm text-black focus:ring-2 focus:ring-gray-900"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                {editingUser
                  ? "New Password (Leave blank to keep current)"
                  : "Password"}
              </label>
              <input
                type="password"
                className="px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm text-black focus:ring-2 focus:ring-gray-900"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingUser}
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">
                Role Access
              </label>
              <select
                className="px-5 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm text-black cursor-pointer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="WAITER">WAITER</option>
                <option value="KITCHEN">KITCHEN</option>
                <option value="FRONT_OFFICE">FRONT OFFICE</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={register.isPending || update.isPending}
            className="w-full bg-gray-900 text-white font-black py-5 rounded-3xl hover:bg-blue-600 transition disabled:opacity-50 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 mt-4"
          >
            {register.isPending || update.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : editingUser ? (
              <>
                <Save size={18} /> Update Employee
              </>
            ) : (
              <>
                <UserPlus size={18} /> Confirm Registration
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
