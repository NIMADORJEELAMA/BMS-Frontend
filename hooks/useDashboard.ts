import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "http://localhost:3000";

export const useTableLayout = () => {
  return useQuery({
    queryKey: ["table-layout"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/orders/table-layout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    // Keep data fresh but don't spam the server
    refetchInterval: 30000, // Background refresh every 30 seconds
  });
};
