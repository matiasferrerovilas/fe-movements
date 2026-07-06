import { useQuery } from "@tanstack/react-query";
import { getAllCurrencies } from "@/apis/currency/CurrencyApi";

const CURRENCY_QUERY_KEY = "currencies" as const;

export const useCurrency = () =>
  useQuery({
    queryKey: [CURRENCY_QUERY_KEY],
    queryFn: () => getAllCurrencies(),
    staleTime: 10000,
  });
