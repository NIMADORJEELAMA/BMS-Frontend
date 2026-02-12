// components/menu/MenuTable.tsx
"use client";
import { Pencil, Utensils, Beer } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: "FOOD" | "ALCOHOL";
}

interface MenuTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
}

export default function MenuTable({ items, onEdit }: MenuTableProps) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 divide-y divide-gray-50">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${item.type === "FOOD" ? "bg-orange-50 text-orange-600" : "bg-purple-50 text-purple-600"}`}
              >
                {item.type === "FOOD" ? (
                  <Utensils size={18} />
                ) : (
                  <Beer size={18} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-900 uppercase tracking-tight">
                    {item.name}
                  </p>
                  <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold">
                    {item.category}
                  </span>
                </div>
                <p className="font-bold text-blue-600 text-sm mt-0.5">
                  ₹{item.price.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => onEdit(item)}
              className="p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all"
            >
              <Pencil size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
