"use client";
import DeleteItemModal from "@/components/menu/DeleteItemModal";
import MenuItemForm from "@/components/menu/MenuItemForm";
import MenuModal from "@/components/menu/MenuModal";
import MenuTable from "@/components/menu/MenuTable";
import { Button } from "@/components/ui/button";
import { useAlcoholInventory } from "@/hooks/useAlcoholInventory";
import {
  useCreateMenuItem,
  useMenu,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUploadMenuCsv,
} from "@/hooks/useMenu";
import { FileDown, Loader2, Plus, Tag, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function MenuPage() {
  const { data: menuItems = [], isLoading } = useMenu();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const uploadMutation = useUploadMenuCsv();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    type: "FOOD" as "FOOD" | "ALCOHOL",
    inventoryItemId: "",
    isVeg: false,
    isActive: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMenuItemFormOpen, setIsMenuItemFormOpen] = useState<boolean>(false); // Toggle for create form
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
      id: "",
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
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data);
        setIsPreviewOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast.error("Error parsing CSV: " + error.message);
      },
    });
  };

  const handleConfirmUpload = () => {
    // We send the original file or the parsed JSON?
    // Sending the File is better so the server can re-validate.
    // However, for this preview, let's assume we send the data we just verified.
    uploadMutation.mutate(previewData, {
      onSuccess: () => {
        setIsPreviewOpen(false);
        setPreviewData([]);
        toast.success("Bulk upload successful!");
      },
    });
  };
  const downloadCsvTemplate = () => {
    // Define the headers based on your NestJS Service requirements
    const headers = ["name", "price", "category", "type", "isVeg"];
    const sampleRow = ["Margherita Pizza", "12.99", "PIZZA", "FOOD", "true"];

    const csvContent = [headers, sampleRow].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "menu_template.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          resetForm();
          setIsMenuItemFormOpen(false); // Optional: close form on success
        },
        onError: (error: any) => {
          // This extracts the "An item named..." message from your JSON response
          const message =
            error?.response?.data?.message || "Something went wrong";
          toast.error(message);
        },
      },
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData?.id) return;

    // 1. Prepare the data
    const dataToSend = {
      ...formData,
      name: formData.name.toUpperCase().trim(),
      price: Number(formData.price),
      category: formData.category.toUpperCase().trim(),
      isActive: formData.isActive,
    };

    // 2. Use 'payload' as the key to match your hook
    updateMutation.mutate(
      {
        id: formData?.id,
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
    setIsMenuItemFormOpen(false);
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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Basic file type validation
    if (file.type !== "text/csv") {
      toast.error("Please upload a valid CSV file");
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        toast.success(`Bulk upload successful!`);
        // if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "CSV Upload failed");
      },
    });
  };

  return (
    <div className="mx-auto space-y-8 p-8 bg-white min-h-screen">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex justify-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCsvUpload}
              accept=".csv"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCsvTemplate}
              className="text-muted-foreground"
            >
              <FileDown className="mr-2" size={16} />
              Download Template
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <Upload className="mr-2" size={18} />
              )}
              Bulk Upload (CSV)
            </Button>
            <Button variant="default" onClick={handleMenuModel}>
              {isMenuItemFormOpen ? (
                <>
                  <X size={18} /> Close Form
                </>
              ) : (
                <>
                  <Plus size={18} /> Add New Item
                </>
              )}
            </Button>
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
          onCancel={() => setIsMenuItemFormOpen(false)}
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
