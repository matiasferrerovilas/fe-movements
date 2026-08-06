import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCurrency,
  deleteCurrency,
  getAllCurrencies,
  type AddCurrencyPayload,
} from "@/apis/currency/CurrencyApi";
import { CURRENCY_QUERY_KEY } from "@/apis/hooks/currencyQueryKeys";

export const useCurrency = () =>
  useQuery({
    queryKey: CURRENCY_QUERY_KEY,
    queryFn: () => getAllCurrencies(),
    staleTime: 10000,
  });

export const useAddCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCurrencyPayload) => addCurrency(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENCY_QUERY_KEY });
    },
    onError: (err) => console.error("Error agregando moneda:", err),
  });
};

export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCurrency(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENCY_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ["user-defaults", "DEFAULT_CURRENCY"],
      });
    },
    onError: (err) => console.error("Error eliminando moneda:", err),
  });
};
