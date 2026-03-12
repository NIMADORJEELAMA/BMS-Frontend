"use client";
import DeleteItemModal from "@/components/menu/DeleteItemModal";
import MenuItemForm from "@/components/menu/MenuItemForm";
import MenuModal from "@/components/menu/MenuModal";
import MenuTable from "@/components/menu/MenuTable";
import { Button } from "@/components/ui/button";
import { useInventoryList } from "@/hooks/useInventoryList";
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
import { MenuItem } from "@/app/types/menu";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";

import BulkPreviewModal from "./BulkPreviewModal";
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
    type: "FOOD" as "FOOD" | "DRINKS",
    inventoryItemId: "",
    isVeg: false,
    isActive: true,
    portionSize: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const [isMenuItemFormOpen, setIsMenuItemFormOpen] = useState<boolean>(false); // Toggle for create form
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: fullInventory = [] } = useInventoryList();
  const handleMenuModel = () => {
    queryClient.invalidateQueries({ queryKey: ["all-inventory"] });

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
      portionSize: 0,
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

  const handleConfirmUpload = (finalData: any[]) => {
    // Now we use finalData instead of previewData state
    uploadMutation.mutate(finalData, {
      onSuccess: () => {
        setIsPreviewOpen(false);
        setPreviewData([]);
        toast.success("Bulk upload successful!");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Upload failed");
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
        inventoryItemId: formData.inventoryItemId || null,
        portionSize: formData.portionSize || 1,
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

    const dataToSend = {
      ...formData,
      name: formData.name.toUpperCase().trim(),
      price: Number(formData.price),
      category: formData.category.toUpperCase().trim(),
      isActive: formData.isActive,
      portionSize: formData.portionSize ? Number(formData.portionSize) : 1,
    };

    updateMutation.mutate(
      {
        id: formData?.id,
        payload: dataToSend,
      },
      {
        onSuccess: () => {
          toast.success("Item updated successfully");
          setIsModalOpen(false);
          resetForm();
        },
        onError: (error: any) => {
          // Robust message extraction
          const responseMessage = error?.response?.data?.message;

          const errorMessage = Array.isArray(responseMessage)
            ? responseMessage.join(", ") // Joins multiple validation errors: "Name is too short, Price must be a number"
            : responseMessage ||
              error.message ||
              "An unexpected error occurred";

          toast.error(errorMessage);

          console.error("Update Error:", {
            status: error?.response?.status,
            message: errorMessage,
            fullError: error,
          });
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
    queryClient.invalidateQueries({ queryKey: ["all-inventory"] });
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
      portionSize: item.portionSize,
    });
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation before parsing
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Logic to sanitize data (optional but recommended)
        const sanitizedData = results.data.map((item: any) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          isVeg: String(item.isVeg).toLowerCase() === "true",
        }));

        setPreviewData(sanitizedData);
        setIsPreviewOpen(true);

        // Reset input so the same file can be uploaded again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error) => {
        toast.error("Error parsing CSV: " + error.message);
      },
    });
  };

  return (
    <div className="mx-auto space-y-8 p-8 bg-white  ">
      <header className="space-y-4">
        {/* This input remains hidden but accessible via Ref */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv"
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left Side: Create Action */}
          <div>
            <Button variant="default" onClick={handleMenuModel}>
              {isMenuItemFormOpen ? (
                <>
                  <X size={18} className="mr-2" /> Close Form
                </>
              ) : (
                <>
                  <Plus size={18} className="mr-2" /> Add New Item
                </>
              )}
            </Button>
          </div>

          {/* Right Side: CSV Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="terminalGhost"
              onClick={downloadCsvTemplate}
              className="whitespace-nowrap"
            >
              <FileDown className="mr-2" size={16} />
              Download Template
            </Button>

            <Button
              variant="terminalGhost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="whitespace-nowrap"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <Upload className="mr-2" size={18} />
              )}
              Bulk Upload (CSV)
            </Button>
          </div>
        </div>

        {/* Preview Modal is placed outside the layout flow */}
        <BulkPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          data={previewData}
          onConfirm={handleConfirmUpload}
          isPending={uploadMutation.isPending}
        />
      </header>

      {isMenuItemFormOpen && (
        <MenuItemForm
          formData={formData}
          setFormData={setFormData}
          inventory={fullInventory ?? []}
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
        inventory={fullInventory}
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
