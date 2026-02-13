"use client";
import {
  Utensils,
  Beer,
  Link,
  Loader2,
  Plus,
  IndianRupee,
  Hash,
  Leaf,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItemFormProps {
  formData: {
    name: string;
    price: string;
    category: string;
    type: "FOOD" | "ALCOHOL";
    isVeg: boolean;
    inventoryItemId: string;
  };
  setFormData: (data: any) => void;
  alcoholInventory: any[];
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MenuItemForm({
  formData,
  setFormData,
  alcoholInventory,
  isPending,
  onSubmit,
}: MenuItemFormProps) {
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">
          Create Menu Item
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Add a new food or alcohol item to your menu
        </p>
      </div>

      {/* BODY */}
      <div className="p-8 space-y-8">
        {/* CORE FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Item Name
            </label>
            <input
              placeholder="Truffle Pasta"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none text-sm"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Price
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Category
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Main Course"
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* TYPE + DIET */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Type */}
          <div className="w-full md:w-72">
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Menu Type
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(["FOOD", "ALCOHOL"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateField("type", t)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.type === t
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "FOOD" ? <Utensils size={14} /> : <Beer size={14} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full md:w-72"
            >
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Dietary Preference
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[
                  { label: "Veg", value: true, icon: <Leaf size={14} /> },
                  {
                    label: "Non-Veg",
                    value: false,
                    icon: <Flame size={14} />,
                  },
                ].map((diet) => (
                  <button
                    key={diet.label}
                    type="button"
                    onClick={() => updateField("isVeg", diet.value)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      formData.isVeg === diet.value
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {diet.icon}
                    {diet.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* STATUS TOGGLE - Add this below the TYPE + DIET section */}
          <div className="w-full md:w-72">
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Item Status
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { label: "Active", value: true, color: "text-emerald-600" },
                { label: "Disabled", value: false, color: "text-slate-500" },
              ].map((status) => (
                <button
                  key={status.label}
                  type="button"
                  onClick={() => updateField("isActive", status.value)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.isActive === status.value
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.value ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INVENTORY LINK */}
        <AnimatePresence>
          {formData.type === "ALCOHOL" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-slate-600 block">
                Link Inventory Item{" "}
                <span className="text-red-700 text-l">*</span>
              </label>

              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.inventoryItemId}
                  onChange={(e) =>
                    updateField("inventoryItemId", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-200 outline-none text-sm bg-white"
                  required
                >
                  <option value="">Select inventory item</option>
                  {alcoholInventory.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} — {inv.currentStock} {inv.unit}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="flex px-8 py-6 border-t border-slate-100 bg-slate-50 justify-around">
        <div className="w-md">
          <button
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-white-100 text-slate-900 border-1 font-semibold text-sm flex items-center justify-center gap-2 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <h3>Cancel</h3>
              </>
            )}
          </button>
        </div>
        <div className="w-md">
          <button
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-60 border-2 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <h3>Confirm</h3>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
