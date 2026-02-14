"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Loader2,
  Search,
  IndianRupee,
  PackagePlus,
  Tags,
  Scale,
  ClipboardList,
} from "lucide-react";
import api from "@/lib/axios";

interface StockInFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockInForm({ onClose, onSuccess }: StockInFormProps) {
  const [loading, setLoading] = useState(false);
  const [existingItems, setExistingItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    type: "FOOD",
    reason: "",
    purchasePrice: "",
  });

  useEffect(() => {
    api.get("/inventory/stocks").then((res) => setExistingItems(res.data));
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items for the search dropdown
  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    return existingItems.filter((i: any) =>
      i?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, existingItems]);

  const handleSelect = (item: any) => {
    setFormData({
      ...formData,
      name: item.name,
      type: item.type,
      unit: item.unit,
    });
    setSearchTerm(item.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/inventory/stock-in", {
        ...formData,
        name: searchTerm || formData.name,
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <PackagePlus size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Stock Inbound
            </h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Inventory Management
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Item Selection */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <Search size={12} className="text-slate-400" />
            Search or Create Item
          </label>
          <input
            required
            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 font-medium text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Search SKU or type new name..."
          />

          {showDropdown && filteredItems.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto overflow-x-hidden">
              {filteredItems.map((item: any) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full p-3 hover:bg-slate-50 flex justify-between items-center text-left transition-colors border-b border-slate-50 last:border-0"
                >
                  <span className="text-sm font-semibold text-slate-700 uppercase">
                    {item.name}
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantities Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <Scale size={12} className="text-slate-400" />
              Quantity
            </label>
            <input
              required
              type="number"
              className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 font-medium text-sm focus:border-indigo-500 outline-none"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Unit
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-xs uppercase outline-none cursor-pointer"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
            >
              <option value="pcs">Pieces (PCS)</option>
              <option value="kg">Kilograms (KG)</option>
              <option value="ml">Milliliters (ML)</option>
              <option value="ltr">Liters (LTR)</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <IndianRupee size={12} className="text-slate-400" />
            Total Purchase Price
          </label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 font-medium text-sm focus:border-indigo-500 outline-none"
            value={formData.purchasePrice}
            onChange={(e) =>
              setFormData({ ...formData, purchasePrice: e.target.value })
            }
          />
          <p className="text-[10px] text-slate-400 font-medium  ">
            * This value will be used for inventory valuation.
          </p>
        </div>

        {/* Category Selector */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <Tags size={12} className="text-slate-400" />
            Classification
          </label>
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
            {["FOOD", "ALCOHOL"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t as any })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                  formData.type === t
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Finalize Entry"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
