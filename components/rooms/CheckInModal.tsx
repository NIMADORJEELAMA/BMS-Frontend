"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Loader2,
  LogIn,
  User,
  Phone,
  DoorOpen,
  Plus,
  Trash2,
  IdCard,
  MapPin,
  Users,
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
import { Button } from "@/components/ui/button";

// Schema for secondary guests
const secondaryGuestSchema = z.object({
  name: z.string().min(2, "Name required"),
  aadhar: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Main Check-In Schema
const checkInSchema = z.object({
  roomId: z.string().min(1, "Select a room"),
  guestName: z.string().min(2, "Primary name required"),
  guestPhone: z.string().min(10, "Valid phone required"),
  primaryAadhar: z.string().optional(),
  primaryAddress: z.string().optional(),
  secondaryGuests: z.array(secondaryGuestSchema).default([]),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

export default function CheckInModal({ isOpen, onClose }: any) {
  const queryClient = useQueryClient();

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      roomId: "",
      guestName: "",
      guestPhone: "",
      primaryAadhar: "",
      primaryAddress: "",
      secondaryGuests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "secondaryGuests",
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["available-rooms"],
    queryFn: async () =>
      (await api.get("/rooms")).data.filter(
        (r: any) => r.status === "AVAILABLE" && r.isActive,
      ),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: CheckInFormValues) => api.post("/rooms/check-in", data),
    onSuccess: () => {
      toast.success("Guest group checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Check-in failed"),
  });

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-white max-w-3xl rounded-[28px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <VisuallyHidden.Root>
          <DialogTitle>Guest Check-In</DialogTitle>
          <DialogDescription>
            Registration for primary and additional guests.
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
              Check-In Registration
            </h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Front Office / Multi-Guest Entry
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="p-8 space-y-8"
            >
              {/* Section 1: Room & Primary Identity */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                  Room & Primary Guest
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="roomId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          <DoorOpen size={12} className="text-slate-400" />{" "}
                          Assign Room <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200">
                              <SelectValue
                                placeholder={
                                  roomsLoading ? "Loading..." : "Choose Room"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rooms.map((r: any) => (
                              <SelectItem key={r.id} value={r.id}>
                                Room {r.roomNumber} ({r.type}) — ₹{r.basePrice}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guestName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          <User size={12} className="text-slate-400" /> Full
                          Name <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Primary Guest Name"
                            {...field}
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          <Phone size={12} className="text-slate-400" /> Phone
                          Number <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+91 ..."
                            {...field}
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primaryAadhar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          <IdCard size={12} className="text-slate-400" /> Aadhar
                          Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12 Digit ID"
                            {...field}
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="primaryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        <MapPin size={12} className="text-slate-400" />{" "}
                        Permanent Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street, City, State, Zip"
                          {...field}
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 2: Secondary Guests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Additional Guests ({fields.length})
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ name: "", aadhar: "", phone: "", address: "" })
                    }
                    className="rounded-lg h-8 text-[10px] font-bold uppercase border-indigo-100 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                  >
                    <Plus size={14} className="mr-1" /> Add Guest
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 relative animate-in fade-in slide-in-from-top-2"
                    >
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`secondaryGuests.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Guest Name *"
                                  {...field}
                                  className="bg-white border-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`secondaryGuests.${index}.aadhar`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Aadhar Number"
                                  {...field}
                                  className="bg-white border-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`secondaryGuests.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Phone (Optional)"
                                  {...field}
                                  className="bg-white border-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`secondaryGuests.${index}.address`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Full Address"
                                  {...field}
                                  className="bg-white border-slate-200"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all shrink-0 cursor-pointer"
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" /> Complete Registration
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
