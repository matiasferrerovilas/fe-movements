import { useQuery } from "@tanstack/react-query";
import { getInvestmentTypesApi } from "../investment/InvestmentApi";

const INVESTMENT_TYPES_QUERY_KEY = "investment-types" as const;

export const useInvestmentTypes = () =>
  useQuery({
    queryKey: [INVESTMENT_TYPES_QUERY_KEY],
    queryFn: () => getInvestmentTypesApi(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
