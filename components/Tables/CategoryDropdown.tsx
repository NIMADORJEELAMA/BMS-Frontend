"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, Check, X } from "lucide-react";
import { div } from "framer-motion/client";

interface Category {
  id: string;
  name: string;
}

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
}

export default function CategoryDropdown({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCategoryName =
    selectedCategory === "ALL"
      ? "All Areas"
      : categories.find((c) => c.id === selectedCategory)?.name ||
        "Select Area";

  return (
    <div className="flex">
      <div className="relative w-full md:w-64 cursor-pointer" ref={dropdownRef}>
        {/* Mini Top Label */}
        <div className="absolute -top-5 left-1 flex items-center gap-1.5 pointer-events-none">
          <Filter className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Category Filter
          </span>
        </div>

        {/* Main Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-white border-2 px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-sm  cursor-pointer ${
            isOpen
              ? "border-blue-500 ring-4 ring-blue-50"
              : "border-slate-100 hover:border-slate-300"
          }`}
        >
          <span
            className={`text-sm font-bold cursor-pointer ${selectedCategory === "ALL" ? "text-slate-500" : "text-slate-900"}`}
          >
            {currentCategoryName}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </button>

        {/* Custom Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl mt-2 py-2 overflow-hidden cursor-pointer"
            >
              {/* Search option (Optional) or All Areas */}
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                All Areas
                {selectedCategory === "ALL" && <Check className="w-4 h-4" />}
              </button>

              <div className="h-px bg-slate-100 my-1 mx-2" />

              {/* Dynamic Categories */}
              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 cursor-pointer">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {cat.name}
                    {selectedCategory === cat.id && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="px-4 py-3 text-xs text-slate-400  ">
                  No categories found
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="">
        <AnimatePresence>
          {selectedCategory !== "ALL" && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => setSelectedCategory("ALL")}
              className="p-3 ml-2 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm group cursor-pointer"
              title="Clear Filter"
            >
              <X size={18} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
