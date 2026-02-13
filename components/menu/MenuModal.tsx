"use client";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItemForm from "./MenuItemForm"; // Your existing form

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  //   onDelete: (id: string) => void;
  formData: any;
  setFormData: (data: any) => void;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  alcoholInventory: any[];
  isActive?: boolean;
}

export default function MenuModal({
  isOpen,
  onClose,
  //   onDelete,
  formData,
  setFormData,
  isPending,
  onSubmit,
  alcoholInventory,
}: MenuModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* MODAL CONTENT */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="overflow-y-auto">
            {/* REUSING YOUR FORM COMPONENT */}
            <MenuItemForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              isPending={isPending}
              alcoholInventory={alcoholInventory}
            />

            {/* <div className="px-8 pb-8">
              <div className="p-6 rounded-2xl bg-red-50 border border-red-100 mt-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-white text-red-600 shadow-sm">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-900">
                      Danger Zone
                    </h4>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      Deleting <strong>{formData.name}</strong> is permanent.
                      This item will disappear from your POS and digital menus
                      immediately.
                    </p>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you absolutely sure you want to delete ${formData.name}?`,
                          )
                        ) {
                          onDelete(formData.id);
                        }
                      }}
                      className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Confirm & Delete
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
