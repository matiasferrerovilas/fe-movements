import { useQuery } from "@tanstack/react-query";
import { getAllIncomes } from "../income/IncomeAPI";

const INCOME_QUERY_KEY = "income-all" as const;

export const useIncome = () =>
  useQuery({
    queryKey: [INCOME_QUERY_KEY],
    queryFn: () => getAllIncomes(),
  });
