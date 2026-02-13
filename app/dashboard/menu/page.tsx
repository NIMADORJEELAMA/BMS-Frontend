"use client";
import DeleteItemModal from "@/components/menu/DeleteItemModal";
import MenuItemForm from "@/components/menu/MenuItemForm";
import MenuModal from "@/components/menu/MenuModal";
import MenuTable from "@/components/menu/MenuTable";
import { useAlcoholInventory } from "@/hooks/useAlcoholInventory";
import {
  useCreateMenuItem,
  useMenu,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "@/hooks/useMenu";
import { Loader2, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MenuPage() {
  const { data: menuItems = [], isLoading } = useMenu();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    type: "FOOD" as "FOOD" | "ALCOHOL",
    inventoryItemId: "",
    isVeg: false,
    isActive: true,
  });

  const [isMenuItemFormOpen, setIsMenuItemFormOpen] = useState<boolean>(false); // Toggle for create form
  const { data: alcoholInventory = [] } = useAlcoholInventory(
    formData.type === "ALCOHOL",
  );

  const handleMenuModel = () => {
    setIsMenuItemFormOpen(!isMenuItemFormOpen);
    resetForm();
  };

  const openDelete = (item: any) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      type: "FOOD",
      inventoryItemId: "",
      isVeg: false,
      isActive: true,
    });
    setSelectedItem(null); // Clear the selected item reference
  };
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
            isVeg: false,
            isActive: true,
          });
          resetForm();
        },
      },
    );
  };
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    // 1. Prepare the data
    const dataToSend = {
      ...formData,
      name: formData.name.toUpperCase().trim(),
      price: Number(formData.price),
      category: formData.category.toUpperCase().trim(),
    };

    // 2. Use 'payload' as the key to match your hook
    updateMutation.mutate(
      {
        id: formData.id,
        payload: dataToSend, // Changed from 'data' to 'payload'
      },
      {
        onSuccess: () => {
          toast.success("Item updated successfully");
          setIsModalOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error("Update failed. Check console.");
          console.error(error);
        },
      },
    );
  };
  const handleConfirmDelete = () => {
    if (!activeItem?.id) return;

    deleteMutation.mutate(activeItem.id, {
      onSuccess: () => {
        toast.success(`${activeItem.name} has been archived`);
        setIsDeleteOpen(false); // Close the modal
        setActiveItem(null); // Clear reference
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Deletion failed");
      },
    });
  };
  const handleEditClick = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      id: item.id, // Important for updates/deletes
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      type: item.type,
      isVeg: item.isVeg,
      inventoryItemId: item.inventoryItemId || "",
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto space-y-8 p-8 bg-white min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex justify-end">
            <button
              onClick={handleMenuModel}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm cursor-pointer
            ${
              isMenuItemFormOpen
                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-black"
            }`}
            >
              {isMenuItemFormOpen ? (
                <>
                  <X size={18} /> Close Form
                </>
              ) : (
                <>
                  <Plus size={18} /> Add New Item
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {isMenuItemFormOpen && (
        <MenuItemForm
          formData={formData}
          setFormData={setFormData}
          alcoholInventory={alcoholInventory}
          isPending={createMutation.isPending}
          onSubmit={handleCreate}
        />
      )}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <MenuTable
          items={menuItems}
          onEdit={handleEditClick}
          onDelete={openDelete}
        />
      )}

      {/* Keep EditMenuItemModal as is, using synced state */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // onDelete={handleDelete}
        formData={formData}
        setFormData={setFormData}
        isPending={updateMutation.isPending || deleteMutation.isPending}
        onSubmit={handleUpdate}
        alcoholInventory={alcoholInventory}
      />

      <DeleteItemModal
        isOpen={isDeleteOpen}
        itemName={activeItem?.name || ""}
        isPending={deleteMutation.isPending}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
