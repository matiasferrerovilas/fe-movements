import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBank, deleteBank, getAllBanks } from "../banks/BankApi";

export const BANKS_QUERY_KEY = ["banks"] as const;

export const useBanks = () =>
  useQuery({
    queryKey: BANKS_QUERY_KEY,
    queryFn: () => getAllBanks(),
    staleTime: 5 * 60 * 1000,
  });

export const useAddBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => addBank(description),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BANKS_QUERY_KEY });
    },
    onError: (err) => console.error("Error agregando banco:", err),
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBank(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BANKS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: ["user-defaults", "DEFAULT_BANK"],
      });
    },
    onError: (err) => console.error("Error eliminando banco:", err),
  });
};
