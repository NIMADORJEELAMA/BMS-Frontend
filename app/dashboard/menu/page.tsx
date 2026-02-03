"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch menu items
  const fetchMenu = async () => {
    try {
      const res = await api.get("/menu");
      setMenuItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 2. Handle Create Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setLoading(true);
    try {
      // Matches your BE: data: { name: string; price: number }
      await api.post("/menu", {
        name,
        price: parseFloat(price),
      });

      setName("");
      setPrice("");
      fetchMenu(); // Refresh the list
    } catch (err) {
      alert("Error adding menu item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <p className="text-gray-500">
          Add food items and set prices for minizeo
        </p>
      </div>

      {/* Create Item Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Add New Dish</h2>
        <form
          onSubmit={handleCreateItem}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Item Name (e.g. Chicken Biryani)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price (₹)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Adding..." : "Add to Menu"}
          </button>
        </form>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">
                Item Name
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase text-right">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y text-black">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                  ₹{item.price.toFixed(2)}
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No items in the menu yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
