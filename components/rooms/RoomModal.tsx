"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  X,
  Loader2,
  Save,
  BedDouble,
  Hash,
  Banknote,
  Hotel,
} from "lucide-react";
import toast from "react-hot-toast";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Validation Schema
const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.enum(["STANDARD", "DELUXE", "SUITE"]),
  basePrice: z.coerce.number().min(1, "Price must be greater than 0"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export default function RoomModal({ isOpen, onClose, initialData }: any) {
  const queryClient = useQueryClient();

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: "",
      type: "DELUXE",
      basePrice: 0,
    },
  });

  // 2. Sync form when editing starts
  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        roomNumber: initialData.roomNumber,
        type: initialData.type,
        basePrice: initialData.basePrice,
      });
    } else if (!initialData && isOpen) {
      form.reset({ roomNumber: "", type: "DELUXE", basePrice: 0 });
    }
  }, [initialData, isOpen, form]);

  const mutation = useMutation({
    mutationFn: (data: RoomFormValues) => {
      return initialData
        ? api.patch(`/rooms/${initialData.id}`, data)
        : api.post("/rooms", data);
    },
    onSuccess: () => {
      toast.success(initialData ? "Inventory updated" : "Room added to resort");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Internal server error"),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-white max-w-md rounded-[28px] overflow-hidden shadow-2xl">
        <VisuallyHidden.Root>
          <DialogTitle>Room Configuration</DialogTitle>
          <DialogDescription>
            Add or edit resort room details and pricing.
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header - Matching "Stock Inbound" DNA */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Hotel size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {initialData ? `${initialData.roomNumber}` : "New Room"}
              </h2>
              {/* <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                Inventory Configuration
              </p> */}
            </div>
          </div>
          {/* <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button> */}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="p-8 space-y-6"
          >
            <div className="space-y-4">
              {/* Room Number */}
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <Hash size={12} className="text-slate-400" /> Room
                      Identity
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 101"
                        {...field}
                        className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500/20 font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Room Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <BedDouble size={12} className="text-slate-400" />{" "}
                      Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold text-xs uppercase">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="STANDARD">Standard Room</SelectItem>
                        <SelectItem value="DELUXE">Deluxe Room</SelectItem>
                        <SelectItem value="SUITE">Executive Suite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Base Price */}
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <Banknote size={12} className="text-slate-400" /> Nightly
                      Rate (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500/20 font-black   text-md"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    {initialData ? "Update Inventory" : "Confirm Addition"}
                  </>
                )}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
