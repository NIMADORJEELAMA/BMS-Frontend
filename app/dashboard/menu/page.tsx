"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Utensils, Beer, Link, Loader2, Plus, Tag, Pencil } from "lucide-react";

import { useMenu, useCreateMenuItem, useUpdateMenuItem } from "@/hooks/useMenu";
import { useAlcoholInventory } from "@/hooks/useAlcoholInventory";
import EditMenuItemModal from "@/components/menu/EditMenuItemModal";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: "FOOD" | "ALCOHOL";
  inventoryItemId?: string | null;
}

export default function MenuPage() {
  /* ------------------ QUERIES ------------------ */
  const { data: menuItems = [], isLoading } = useMenu();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();

  /* ------------------ FORM STATE ------------------ */
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"FOOD" | "ALCOHOL">("FOOD");
  const [inventoryItemId, setInventoryItemId] = useState("");

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /* ------------------ INVENTORY ------------------ */
  const { data: alcoholInventory = [] } = useAlcoholInventory(
    type === "ALCOHOL",
  );

  /* ------------------ CREATE ------------------ */
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      toast.error("Missing required fields");
      return;
    }

    createMutation.mutate(
      {
        name: name.toUpperCase().trim(),
        price: Number(price),
        category: category.toUpperCase().trim(),
        type,
        inventoryItemId: type === "ALCOHOL" ? inventoryItemId : null,
      },
      {
        onSuccess: () => {
          toast.success("Menu item added");
          setName("");
          setPrice("");
          setCategory("");
          setInventoryItemId("");
          setType("FOOD");
        },
        onError: (err: any) =>
          toast.error(err.response?.data?.message || "Create failed"),
      },
    );
  };

  /* ------------------ EDIT ------------------ */
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setType(item.type);
    setInventoryItemId(item.inventoryItemId || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateMutation.mutate(
      {
        id: editingItem.id,
        payload: {
          name: name.toUpperCase().trim(),
          price: Number(price),
          category: category.toUpperCase().trim(),
          type,
          inventoryItemId: type === "ALCOHOL" ? inventoryItemId : null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Item updated");
          setIsEditModalOpen(false);
          setEditingItem(null);
        },
        onError: (err: any) =>
          toast.error(err.response?.data?.message || "Update failed"),
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8 bg-white min-h-screen">
      {/* HEADER */}
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

      {/* CREATE FORM (RESTORED) */}
      <form
        onSubmit={handleCreateItem}
        className="bg-white p-8 rounded-[40px] border shadow-xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input
            placeholder="ITEM NAME"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-modern uppercase"
          />

          <input
            type="number"
            placeholder="PRICE"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-modern"
          />

          <input
            placeholder="CATEGORY"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-modern uppercase"
          />

          {/* FOOD / ALCOHOL TOGGLE */}
          <div className="flex bg-gray-50 p-1 rounded-2xl">
            {["FOOD", "ALCOHOL"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t as any)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-black ${
                  type === t ? "bg-gray-900 text-white" : "text-gray-400"
                }`}
              >
                {t === "FOOD" ? <Utensils size={12} /> : <Beer size={12} />}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* INVENTORY DROPDOWN (RESTORED) */}
        {type === "ALCOHOL" && (
          <div className="p-6 bg-purple-50 rounded-[24px] border flex items-center gap-4">
            <Link className="text-purple-600" />
            <select
              value={inventoryItemId}
              onChange={(e) => setInventoryItemId(e.target.value)}
              className="flex-1 px-5 py-4 bg-white rounded-2xl font-bold"
              required
            >
              <option value="">SELECT INVENTORY BOTTLE</option>
              {alcoholInventory.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name} ({inv.currentStock} {inv.unit})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          disabled={createMutation.isPending}
          className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest"
        >
          {createMutation.isPending ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <>
              <Plus size={16} /> Publish to Menu
            </>
          )}
        </button>
      </form>

      {/* MENU LIST */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border overflow-hidden">
          {menuItems.map((item: MenuItem) => (
            <div
              key={item.id}
              className="flex justify-between p-6 border-b hover:bg-gray-50"
            >
              <div>
                <p className="font-black uppercase">{item.name}</p>
                <p className="text-xs text-gray-400">
                  ₹{item.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => openEditModal(item)}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
              >
                <Pencil />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <EditMenuItemModal
        isOpen={isEditModalOpen}
        item={editingItem}
        alcoholInventory={alcoholInventory}
        loading={updateMutation.isPending}
        name={name}
        price={price}
        category={category}
        type={type}
        inventoryItemId={inventoryItemId}
        setName={setName}
        setPrice={setPrice}
        setCategory={setCategory}
        setType={setType}
        setInventoryItemId={setInventoryItemId}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateItem}
      />
    </div>
  );
}
