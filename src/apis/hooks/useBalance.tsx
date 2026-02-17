import { useQuery } from "@tanstack/react-query";
import {
  getBalance,
  getBalanceWithCategoryByYear,
  getBalanceWithGroupByYearAndMonth,
} from "../BalanceApi";
import type { BalanceFilters } from "../../routes/balance";

const BALANCE_QUERY_KEY = "balance" as const;
const BALANCE_CATEGORY_QUERY_KEY = "balance-category" as const;

export const useBalance = (filters: BalanceFilters) =>
  useQuery({
    queryKey: [BALANCE_QUERY_KEY, filters],
    queryFn: () => getBalance(filters),
    staleTime: 5 * 1000,
  });

export const useBalanceSeparateByCategory = (filters: BalanceFilters) =>
  useQuery({
    queryKey: [BALANCE_CATEGORY_QUERY_KEY, filters],
    queryFn: () => getBalanceWithCategoryByYear(filters),
    staleTime: 5 * 60 * 1000,
  });

export const useBalanceSeparateByGroup = (year: number, month: number) =>
  useQuery({
    queryKey: [BALANCE_CATEGORY_QUERY_KEY, year, month],
    queryFn: () =>
      getBalanceWithGroupByYearAndMonth({ year: year, month: month }),
    staleTime: 5 * 60 * 1000,
  });
