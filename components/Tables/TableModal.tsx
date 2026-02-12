"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Tag,
  AlertTriangle,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import CategoryManager from "./CategoryManager";

interface TableModalProps {
  isOpen: boolean;
  type: "add" | "edit" | "delete" | null;
  activeTable: any;
  categories: any[];
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  onCategoryCreated: (newCat: any) => void;
}

export default function TableModal({
  isOpen,
  type,
  activeTable,
  categories,
  onClose,
  onConfirm,
  onCategoryCreated,
}: TableModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    categoryId: "",
    isActive: true,
  });

  // Sync form data when editing
  useEffect(() => {
    if (type === "edit" && activeTable) {
      setFormData({
        number: activeTable.number,
        categoryId: activeTable.categoryId || "",
        isActive: activeTable.status !== "INACTIVE",
      });
    } else {
      setFormData({ number: "", categoryId: "", isActive: true });
    }
  }, [type, activeTable, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCatLabel =
    categories.find((c) => c.id === formData.categoryId)?.name ||
    "Standard Table";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-9 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {type === "delete" ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Delete Table?
                </h2>
                <p className="text-slate-500 mt-2">
                  Are you sure you want to remove{" "}
                  <span className="font-bold text-slate-800">
                    {activeTable?.number} {""}
                  </span>
                  ? <br /> This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 font-bold text-red-500 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onConfirm(null)}
                    className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-100 hover:bg-red-600 active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Confirm Delete"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <header>
                  <h2 className="text-2xl font-black text-slate-900">
                    {type === "add" ? "Add New Table" : "Edit Table Details"}
                  </h2>
                </header>

                <div className="space-y-4">
                  {/* Table Number Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Table Name
                    </label>
                    <input
                      required
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                      placeholder="e.g. T-01"
                    />
                  </div>

                  {/* Custom Category Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                      Location / Area
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCatOpen(!isCatOpen)}
                        className={`w-full flex items-center justify-between pl-12 pr-5 py-4 bg-slate-50 border-2 rounded-2xl transition-all cursor-pointer ${
                          isCatOpen
                            ? "border-blue-500 bg-white"
                            : "border-transparent hover:bg-slate-100"
                        }`}
                      >
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <span className="font-semibold text-slate-700">
                          {selectedCatLabel}
                        </span>
                        <ChevronDown
                          className={`text-slate-400 transition-transform ${isCatOpen ? "rotate-180" : ""}`}
                          size={18}
                        />
                      </button>

                      <AnimatePresence>
                        {isCatOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden p-2"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, categoryId: "" });
                                setIsCatOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 cursor-pointer"
                            >
                              Standard Table{" "}
                              {formData.categoryId === "" && (
                                <Check size={16} className="text-blue-500" />
                              )}
                            </button>
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    categoryId: cat.id,
                                  });
                                  setIsCatOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 cursor-pointer"
                              >
                                {cat.name}{" "}
                                {formData.categoryId === cat.id && (
                                  <Check size={16} className="text-blue-500" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Active Toggle (Only for Edit) */}
                  {type === "edit" && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">
                          Table Active
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                          Show on floor plan
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            isActive: !formData.isActive,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? "bg-blue-600" : "bg-slate-300"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? "left-7" : "left-1"}`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 font-bold text-slate-900 hover:bg-slate-50 rounded-2xl border-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
