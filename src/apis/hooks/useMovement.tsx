import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MovementFilters } from "../../routes/movement";
import { deleteExpenseApi, getExpenseApi } from "../movement/ExpenseApi";

const MOVEMENT_QUERY_KEY = "movement-history" as const;

export const useMovement = (
  filters: MovementFilters,
  page: number,
  defaultPage: number,
) =>
  useQuery({
    queryKey: [MOVEMENT_QUERY_KEY, page, defaultPage, filters],
    queryFn: () => getExpenseApi({ page, size: defaultPage, filters }),
    refetchOnMount: "always",
  });

export const useDeleteMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpenseApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MOVEMENT_QUERY_KEY] });
    },
  });
};
