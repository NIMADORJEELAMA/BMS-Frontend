import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

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
