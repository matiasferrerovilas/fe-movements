import { useQuery } from "@tanstack/react-query";
import { getAllBanks } from "../banks/BankApi";

const BANKS_QUERY_KEY = "banks" as const;

export const useBanks = () =>
  useQuery({
    queryKey: [BANKS_QUERY_KEY],
    queryFn: () => getAllBanks(),
    staleTime: 10000,
  });
