"use client";
import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Plus,
  Tag,
  Loader2,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoryCreated: (newCat: Category) => void;
  onRefreshCategories: () => void;
}

export default function CategoryManager({
  categories,
  onCategoryCreated,
  onRefreshCategories,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);
  const [selectedEditColor, setSelectedEditColor] = useState("");
  console.log("selectedEditColor", selectedEditColor);
  // Modal States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  console.log("categories, deletingCategory", categories, deletingCategory);
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#64748B",
  ];

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/tables/categories", {
        name: newCategoryName,
        color: selectedColor,
      });
      toast.success("Category added");
      onCategoryCreated(res.data);
      setNewCategoryName("");
    } catch (err: any) {
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !editName.trim()) return;
    try {
      await api.patch(`/tables/categories/${editingCategory.id}`, {
        name: editName,
        color: selectedEditColor,
      });
      toast.success("Updated successfully");
      setEditingCategory(null);
      onRefreshCategories();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    // Store ID locally so we don't rely on state that might change during the async call
    const idToDelete = deletingCategory.id;

    try {
      await api.delete(`/tables/categories/${idToDelete}`);

      // 1. Success Toast FIRST
      toast.success("Category removed successfully");

      // 2. Close the modal/reset state IMMEDIATELY
      setDeletingCategory(null);

      // 3. Trigger the refresh
      await onRefreshCategories();
    } catch (err: any) {
      // Only show error toast if the request actually failed
      console.error("Delete Error:", err);
      const msg =
        err.response?.data?.message ||
        "Cannot delete category currently in use";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 p-3 ">
      {/* ADD SECTION: Consistent Block UI */}
      <div className="p-5 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Tag size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Add New Category</h3>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category Name"
            className="flex-1 px-4 py-3 text-sm rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-bold outline-none"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            disabled={loading || !newCategoryName.trim()}
            className="bg-slate-900 text-white px-6 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between px-2 mr-4">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-4">
            Theme
          </span>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full transition-all ring-offset-2 ${selectedColor === color ? "ring-2 scale-110 shadow-md" : "hover:scale-105"}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* LIST SECTION: Scrollable with hidden scrollbar */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
          Existing Categories
        </p>

        {/* Added max-height, overflow-y-auto, and no-scrollbar */}
        <div className="grid grid-cols-1 gap-2 max-h-[640px] overflow-y-auto no-scrollbar pr-1">
          <AnimatePresence>
            {categories.map((cat) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={cat.id}
                className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-8 rounded-full"
                    style={{ backgroundColor: cat.color || "#cbd5e1" }}
                  />
                  <span className="text-sm font-bold text-slate-700">
                    {cat.name}
                  </span>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setEditName(cat.name);
                      setSelectedEditColor(cat.color || "#3B82F6");
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(cat)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {categories.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic text-xs">
              No areas created yet.
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS FOR ACTIONS --- */}
      <AnimatePresence>
        {/* EDIT MODAL */}
        {/* EDIT MODAL */}
        {editingCategory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCategory(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-black text-slate-900 mb-6">
                Edit Category
              </h2>

              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Category Name
                  </label>
                  <input
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold transition-all"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Color Picker inside Edit Modal */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Update Theme Color
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedEditColor(color)}
                        className={`w-7 h-7 rounded-full transition-all ring-offset-2 ${
                          selectedEditColor === color
                            ? "ring-2 scale-110 shadow-md"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-3 font-bold text-slate-500 rounded-xl border-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deletingCategory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingCategory(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Remove Area?
              </h2>
              <p className="text-slate-500 text-sm mt-2 mb-6">
                This will unassign all tables from{" "}
                <span className="font-bold text-slate-800">
                  {deletingCategory.name}
                </span>
                .
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingCategory(null)}
                  className="flex-1 py-3 font-bold text-slate-500 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
