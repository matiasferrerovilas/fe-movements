import { useQuery } from "@tanstack/react-query";
import { getAllCurrencies } from "../currencies/CurrencyApi";

const CURRENCY_QUERY_KEY = "currencies" as const;

export const useCurrency = () =>
  useQuery({
    queryKey: [CURRENCY_QUERY_KEY],
    queryFn: () => getAllCurrencies(),
    staleTime: 10000,
    select: (data) => data,
  });
