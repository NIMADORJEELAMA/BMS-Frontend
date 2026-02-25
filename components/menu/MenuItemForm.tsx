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
import { useState } from "react";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    // Clear error when user starts typing again
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Basic Validation Rules
    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Enter a valid price > 0";
    }
    if (!formData.category.trim()) newErrors.category = "Category is required";

    if (formData.type === "ALCOHOL" && !formData.inventoryItemId) {
      newErrors.inventoryItemId = "Please link an inventory item for alcohol";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(e);
  };

  return (
    <form
      onSubmit={validateAndSubmit}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 block ml-1">
              Item Name
            </label>
            <input
              placeholder="Truffle Pasta"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full px-4 h-10 rounded-xl border transition-all text-sm outline-none ${
                errors.name
                  ? "border-red-500 bg-red-50/30"
                  : "border-slate-200 focus:border-slate-400"
              }`}
            />
            {errors.name && (
              <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">
                {errors.name}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 block ml-1">
              Price
            </label>
            <div className="relative">
              <IndianRupee
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.price ? "text-red-400" : "text-slate-400"}`}
              />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                className={`w-full pl-10 pr-4 h-10 rounded-xl border transition-all text-sm outline-none ${
                  errors.price
                    ? "border-red-500 bg-red-50/30"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">
                {errors.price}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 block ml-1">
              Category
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="Main Course"
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={`w-full pl-10 pr-4 h-10 rounded-xl border transition-all text-sm outline-none ${
                  errors.category
                    ? "border-red-500 bg-red-50/30"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />
            </div>
            {errors.category && (
              <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">
                {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* TYPE + DIET (Simplified height to h-10) */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-72 space-y-2">
            <label className="text-xs font-medium text-slate-600 block ml-1">
              Menu Type
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl h-11">
              {(["FOOD", "ALCOHOL"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateField("type", t)}
                  className={`flex-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.type === t
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {t === "FOOD" ? <Utensils size={14} /> : <Beer size={14} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary preference logic */}
          <AnimatePresence mode="wait">
            <motion.div key="diet" className="w-full md:w-72 space-y-2">
              <label className="text-xs font-medium text-slate-600 block ml-1">
                Dietary
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl h-11">
                {[
                  { label: "Veg", val: true, icon: Leaf },
                  { label: "Non-Veg", val: false, icon: Flame },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => updateField("isVeg", d.val)}
                    className={`flex-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${formData.isVeg === d.val ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
                  >
                    <d.icon size={14} /> {d.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* INVENTORY LINK - Only if ALCOHOL */}
        <AnimatePresence>
          {formData.type === "ALCOHOL" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-medium text-slate-600 block ml-1">
                Link Inventory Item <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.inventoryItemId}
                  onChange={(e) =>
                    updateField("inventoryItemId", e.target.value)
                  }
                  className={`w-full pl-10 h-10 rounded-xl border bg-white text-sm outline-none transition-all ${
                    errors.inventoryItemId
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select inventory item</option>
                  {alcoholInventory.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.currentStock} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>
              {errors.inventoryItemId && (
                <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">
                  {errors.inventoryItemId}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <div className="flex px-8 py-6 border-t border-slate-100 bg-slate-50 gap-4">
        <button
          type="button"
          className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          disabled={isPending}
          type="submit"
          className="flex-1 h-10 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            "Confirm Item"
          )}
        </button>
      </div>
    </form>
  );
}
