"use client";
import { useState, useEffect, useRef } from "react";
import { X, Loader2, Search, IndianRupee } from "lucide-react";
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
    purchasePrice: "", // New Field
  });

  // Load items for search
  useEffect(() => {
    api.get("/inventory/stocks").then((res) => setExistingItems(res.data));

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowDropdown(false);
    }
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
    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
          Stock Entry
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-black transition-colors"
        >
          <X />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-5"
        onKeyDown={handleKeyDown}
      >
        {/* Searchable Name Field */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Item Name (Search or New)
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm uppercase focus:ring-2 focus:ring-gray-900 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="e.g. VODKA / CHICKEN..."
            />
          </div>

          {showDropdown && searchTerm && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-gray-50">
              {existingItems
                .filter((i) =>
                  i?.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((item) => (
                  <div
                    key={item?.id}
                    onClick={() => handleSelect(item)}
                    className="p-4 hover:bg-blue-50 cursor-pointer font-bold text-xs flex justify-between uppercase transition-colors"
                  >
                    <span>{item?.name}</span>
                    <span className="text-gray-400 text-[10px] bg-gray-100 px-2 py-1 rounded-md">
                      {item?.type}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Quantity
            </label>
            <input
              required
              type="number"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-sm"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Unit
            </label>
            <select
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold uppercase text-sm appearance-none cursor-pointer"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
            >
              <option value="pcs">PCS</option>
              <option value="kg">KG</option>
              <option value="ml">ML</option>
            </select>
          </div>
        </div>

        {/* Purchase Price Field */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Purchase Price (Total)
          </label>
          <div className="relative">
            <IndianRupee
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="number"
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Category
          </label>
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
            {["FOOD", "ALCOHOL"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t as any })}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${formData.type === t ? "bg-gray-900 text-white shadow-md" : "text-gray-400"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all flex items-center justify-center shadow-lg shadow-gray-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Update Inventory"}
        </button>
      </form>
    </div>
  );
}
