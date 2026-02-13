import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "react-hot-toast/headless";

export const useMenu = () =>
  useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const { data } = await api.get("/menu");
      return data;
    },
  });

export const useCreateMenuItem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => api.post("/menu", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });
};

export const useUpdateMenuItem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: any) => api.patch(`/menu/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu"] }),
  });
};

export const useDeleteMenuItem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/menu/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Item deleted forever");
    },
    onError: () => {
      toast.error("Failed to delete item");
    },
  });
};
