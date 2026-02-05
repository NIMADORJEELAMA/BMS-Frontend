// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import api from "@/lib/axios";

// // FETCH MENU
// export const useMenu = () => {
//   return useQuery({
//     queryKey: ["menu"],
//     queryFn: async () => {
//       const { data } = await api.get("/menu");
//       return data;
//     },
//   });
// };

// // ADD MENU ITEM (Mutation)
// export const useAddMenuItem = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newItem: any) => {
//       const { data } = await api.post("/menu", newItem);
//       return data;
//     },
//     onSuccess: () => {
//       // This "invalidates" the cache, forcing a fresh fetch automatically!
//       queryClient.invalidateQueries({ queryKey: ["menu"] });
//     },
//   });
// };

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
