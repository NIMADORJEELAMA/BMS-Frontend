"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Plus, Bed, Pencil, Trash2, Loader2, Power } from "lucide-react";
import toast from "react-hot-toast";
import RoomModal from "@/components/rooms/RoomModal";

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null); // For editing

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => (await api.get("/rooms")).data,
  });

  // Mutation for Toggle Active/Inactive
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/rooms/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room status updated");
    },
  });

  // Mutation for Delete with strict confirmation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/rooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room permanently removed");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Delete failed"),
  });

  const handleDelete = (room: any) => {
    const confirm = window.confirm(
      `CRITICAL ACTION: Are you sure you want to delete Room ${room.roomNumber}?\n\nThis will remove all history for this room. If the room is just closed for maintenance, use 'Deactivate' instead.`,
    );
    if (confirm) deleteMutation.mutate(room.id);
  };

  const handleEdit = (room: any) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
            Resort Inventory
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Manage Rooms & Pricing
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={16} /> Add New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-slate-300" size={40} />
          </div>
        ) : (
          rooms.map((room: any) => (
            <div
              key={room.id}
              className={`bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all group relative ${!room.isActive ? "opacity-60 grayscale" : ""}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-2xl transition-colors ${room.isActive ? "bg-slate-50 text-slate-400 group-hover:text-blue-500" : "bg-red-50 text-red-400"}`}
                >
                  <Bed size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: room.id,
                        isActive: !room.isActive,
                      })
                    }
                    title={room.isActive ? "Deactivate Room" : "Activate Room"}
                    className={`p-2 rounded-lg transition-all ${room.isActive ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                  >
                    <Power size={14} />
                  </button>
                  <span
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${room.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-black italic text-slate-900 tracking-tighter">
                Room {room.roomNumber}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {room.type}
              </p>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-lg font-black text-slate-900 italic">
                  ₹{room.basePrice}
                </p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedRoom} // Pass data if editing
      />
    </div>
  );
}
