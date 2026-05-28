import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvestmentTypeApi,
  deleteInvestmentTypeApi,
  getInvestmentTypesApi,
  updateInvestmentTypeApi,
  type InvestmentTypeToAdd,
  type InvestmentTypeToUpdate,
} from "../investment/InvestmentApi";
import { INVESTMENT_TYPES_QUERY_KEY } from "./investmentTypeQueryKeys";

export const useInvestmentTypes = () =>
  useQuery({
    queryKey: INVESTMENT_TYPES_QUERY_KEY,
    queryFn: () => getInvestmentTypesApi(),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useAddInvestmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvestmentTypeToAdd) => createInvestmentTypeApi(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVESTMENT_TYPES_QUERY_KEY });
    },
    onError: (err) => console.error("Error agregando tipo de inversión:", err),
  });
};

export const useUpdateInvestmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InvestmentTypeToUpdate }) =>
      updateInvestmentTypeApi(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVESTMENT_TYPES_QUERY_KEY });
    },
    onError: (err) => console.error("Error actualizando tipo de inversión:", err),
  });
};

export const useDeleteInvestmentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInvestmentTypeApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INVESTMENT_TYPES_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ["user-defaults", "DEFAULT_INVESTMENT_TYPE"],
      });
    },
    onError: (err) => console.error("Error eliminando tipo de inversión:", err),
  });
};
