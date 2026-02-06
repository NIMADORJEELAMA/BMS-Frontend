import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useMonthlyAttendance = (year: number, month: number) => {
  return useQuery({
    queryKey: ["attendance-matrix", year, month],
    queryFn: async () => {
      const { data } = await api.get(`/operations/monthly-attendance`, {
        params: { year, month },
      });
      return data; // Expected: Array of attendance records for the month
    },
  });
};

// src/hooks/useOperations.ts

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; date: string }) =>
      api.post("/operations/attendance/toggle", data), // Changed to toggle
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-matrix"] });
    },
  });
};
