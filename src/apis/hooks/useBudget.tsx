import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBudgetApi,
  deleteBudgetApi,
  getBudgetsApi,
  updateBudgetApi,
} from "../BudgetApi";
import type { BudgetQueryParams, BudgetToAdd, BudgetToUpdate } from "../../models/Budget";

export const BUDGETS_QUERY_KEY = "budgets" as const;

export const useBudgets = (params: BudgetQueryParams) =>
  useQuery({
    queryKey: [BUDGETS_QUERY_KEY, params],
    queryFn: () => getBudgetsApi(params),
    staleTime: 1000 * 60,
  });

export const useAddBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BudgetToAdd) => addBudgetApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY] });
    },
  });
};

export interface UpdateBudgetVariables {
  id: number;
  payload: BudgetToUpdate;
}

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateBudgetVariables) =>
      updateBudgetApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBudgetApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY] });
    },
  });
};
