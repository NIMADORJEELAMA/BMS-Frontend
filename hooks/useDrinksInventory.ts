import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const usedrinksinventory = (enabled: boolean) =>
  useQuery({
    queryKey: ["drinks-inventory"],
    queryFn: async () => {
      const { data } = await api.get("/inventory/stocks", {
        params: { type: "DRINKS" },
      });
      return data.items;
    },
    enabled,
  });
