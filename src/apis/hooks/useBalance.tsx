import { useQuery } from "@tanstack/react-query";
import {
  getBalance,
  getBalanceWithCategoryByYear,
  getBalanceWithGroupByYearAndMonth,
  getMonthlyEvolution,
} from "../BalanceApi";
import type { BalanceFilters } from "../../routes/balance";

const BALANCE_QUERY_KEY = "balance" as const;
const BALANCE_CATEGORY_QUERY_KEY = "balance-category" as const;
const BALANCE_GROUP_QUERY_KEY = "balance-group" as const;

export const useBalance = (filters: BalanceFilters) =>
  useQuery({
    queryKey: [BALANCE_QUERY_KEY, filters],
    queryFn: () => getBalance(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

export const useBalanceSeparateByCategory = (filters: BalanceFilters) =>
  useQuery({
    queryKey: [BALANCE_CATEGORY_QUERY_KEY, filters],
    queryFn: () => getBalanceWithCategoryByYear(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

export const useBalanceSeparateByGroup = (year: number, month: number) =>
  useQuery({
    queryKey: [BALANCE_GROUP_QUERY_KEY, year, month],
    queryFn: () =>
      getBalanceWithGroupByYearAndMonth({ year: year, month: month }),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: "always",
  });

export const useBalanceMonthlyEvolution = (year: number) =>
  useQuery({
    queryKey: ["balance", "monthly-evolution", year],
    queryFn: () => getMonthlyEvolution(year),
    enabled: !!year,
    refetchOnMount: "always",
  });
