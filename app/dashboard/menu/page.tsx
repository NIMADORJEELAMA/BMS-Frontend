"use client";
import MenuItemForm from "@/components/menu/MenuItemForm";
import MenuTable from "@/components/menu/MenuTable";
import { useAlcoholInventory } from "@/hooks/useAlcoholInventory";
import { useCreateMenuItem, useMenu, useUpdateMenuItem } from "@/hooks/useMenu";
import { Loader2, Tag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MenuPage() {
  const { data: menuItems = [], isLoading } = useMenu();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    type: "FOOD" as "FOOD" | "ALCOHOL",
    inventoryItemId: "",
  });

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: alcoholInventory = [] } = useAlcoholInventory(
    formData.type === "ALCOHOL",
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        ...formData,
        name: formData.name.toUpperCase().trim(),
        price: Number(formData.price),
        category: formData.category.toUpperCase().trim(),
        inventoryItemId:
          formData.type === "ALCOHOL" ? formData.inventoryItemId : null,
      },
      {
        onSuccess: () => {
          toast.success("Menu item added");
          setFormData({
            name: "",
            price: "",
            category: "",
            type: "FOOD",
            inventoryItemId: "",
          });
        },
      },
    );
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    // Sync local form state for the modal
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      type: item.type,
      inventoryItemId: item.inventoryItemId || "",
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8 bg-white min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            Menu Studio
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            Minizeo Resort Systems
          </p>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-2xl flex items-center gap-2">
          <Tag size={14} />
          <span className="text-[10px] font-black uppercase">
            {menuItems.length} Total Items
          </span>
        </div>
      </header>

      <MenuItemForm
        formData={formData}
        setFormData={setFormData}
        alcoholInventory={alcoholInventory}
        isPending={createMutation.isPending}
        onSubmit={handleCreate}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <MenuTable items={menuItems} onEdit={openEdit} />
      )}

      {/* Keep EditMenuItemModal as is, using synced state */}
    </div>
  );
}
