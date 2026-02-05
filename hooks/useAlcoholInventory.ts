import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAlcoholInventory = (enabled: boolean) =>
  useQuery({
    queryKey: ["alcohol-inventory"],
    queryFn: async () => {
      const { data } = await api.get("/inventory/stocks", {
        params: { type: "ALCOHOL" },
      });
      return data;
    },
    enabled,
  });
