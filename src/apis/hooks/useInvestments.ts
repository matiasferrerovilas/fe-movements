import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvestmentApi,
  deleteInvestmentApi,
  getInvestmentsApi,
  updateInvestmentApi,
} from "@/apis/investment/InvestmentApi";
import type { CreateInvestmentForm, UpdateInvestmentForm } from "@/models/Investment";

const INVESTMENTS_QUERY_KEY = "investments" as const;

export const useInvestments = (accountId: number | undefined) =>
  useQuery({
    queryKey: [INVESTMENTS_QUERY_KEY, accountId],
    queryFn: () => getInvestmentsApi(accountId!),
    enabled: accountId != null,
    staleTime: 1000 * 60,
  });

export const useCreateInvestment = (
  accountId: number,
  options?: { onSuccess?: () => void },
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateInvestmentForm) => createInvestmentApi(form, accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      options?.onSuccess?.();
    },
  });
};

export const useUpdateInvestment = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: number; form: UpdateInvestmentForm }) =>
      updateInvestmentApi(id, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      options?.onSuccess?.();
    },
  });
};

export const useDeleteInvestment = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInvestmentApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      options?.onSuccess?.();
    },
  });
};
