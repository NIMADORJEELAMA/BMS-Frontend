"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Plus,
  Bed,
  Pencil,
  Trash2,
  Loader2,
  Power,
  MoreVertical,
  Hotel,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import RoomModal from "@/components/rooms/RoomModal";

export default function RoomsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => (await api.get("/rooms")).data,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/rooms/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room status updated");
    },
  });

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
    // In a real enterprise app, use shadcn/ui "AlertDialog" instead of window.confirm
    if (window.confirm(`Delete Room ${room.roomNumber}?`)) {
      deleteMutation.mutate(room.id);
    }
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
    <div className="p-8 space-y-8  mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"></div>
          <h1 className="text-3xl font-black  tracking-tighter text-slate-900 uppercase">
            Room Dashboard
          </h1>
          {/* <div className="p-1.5 bg-slate-900 rounded-md text-white">
            <Hotel size={16} />
          </div> */}
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            Add and Edit Room
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Room
        </Button>
      </div>

      {/* Stats/Filter Row (Optional Visual Polish) */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <Badge
          variant="secondary"
          className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 border-none"
        >
          Total: {rooms.length}
        </Badge>
        <Badge
          variant="secondary"
          className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border-none"
        >
          Available: {rooms.filter((r: any) => r.status === "AVAILABLE").length}
        </Badge>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[220px] w-full rounded-[32px]" />
            ))
          : rooms.map((room: any) => (
              <Card
                key={room.id}
                className={`group relative overflow-hidden rounded-[32px] border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  !room.isActive ? "bg-slate-50/50 opacity-75" : "bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    {/* Status Indicator */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        room.status === "AVAILABLE"
                          ? "bg-emerald-100/50 text-emerald-600"
                          : "bg-amber-100/50 text-amber-600"
                      }`}
                    >
                      <Circle size={8} className="fill-current" />
                      {room.status}
                    </div>

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                        >
                          <MoreVertical size={16} className="text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-40"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEdit(room)}
                          className="text-xs font-semibold"
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleMutation.mutate({
                              id: room.id,
                              isActive: !room.isActive,
                            })
                          }
                          className="text-xs font-semibold"
                        >
                          <Power className="mr-2 h-3.5 w-3.5" />{" "}
                          {room.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(room)}
                          className="text-xs font-semibold text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black  text-slate-900 tracking-tighter uppercase leading-none">
                        {room.roomNumber}
                      </h3>
                      <div
                        className={`p-1 rounded bg-slate-100 text-slate-400 ${!room.isActive && "text-red-400 bg-red-50"}`}
                      >
                        <Bed size={12} />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {room.type}
                    </p>
                  </div>

                  <div className=" border-t border-slate-200 flex  items-end justify-between">
                    <div className="  items-end mt-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        Nightly Rate :
                      </p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">
                        ₹{room.basePrice.toLocaleString()}
                      </p>
                    </div>

                    {!room.isActive && (
                      <Badge
                        variant="destructive"
                        className="bg-red-50 text-red-600 border-none text-[8px] font-black uppercase tracking-widest"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <RoomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={selectedRoom}
      />
    </div>
  );
}
