import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAlcoholInventory = (enabled: boolean) =>
  useQuery({
    queryKey: ["drinks-inventory"],
    queryFn: async () => {
      const { data } = await api.get("/inventory/stocks", {
        params: { type: "DRINKS" },
      });
      return data;
    },
    enabled,
  });
