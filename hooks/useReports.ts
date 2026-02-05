import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const usePerformanceReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["performance-report", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get("/orders/reports/performance", {
        params: { startDate, endDate },
      });
      return data;
    },
    // We keep reports for 2 minutes before considering them "stale"
    staleTime: 1000 * 60 * 2,
  });
};

// src/hooks/useReports.ts

export const useItemDrilldown = (id: string, start: string, end: string) => {
  return useQuery({
    queryKey: ["item-drilldown", id, start, end],
    queryFn: async () => {
      const { data } = await api.get(`/orders/reports/item-drilldown/${id}`, {
        params: { startDate: start, endDate: end },
      });
      return data;
    },
    enabled: !!id, // Only fetch if an ID is provided
  });
};
