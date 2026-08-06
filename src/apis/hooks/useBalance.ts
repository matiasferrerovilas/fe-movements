import { useQuery } from "@tanstack/react-query";
import {
  getBalance,
  getBalanceWithCategoryByYear,
  getMonthlyEvolution,
  getRecoveryTime,
} from "@/apis/BalanceApi";
import type { BalanceFilters } from "@/models/BalanceFilters";
import type { RecoveryTimeParams } from "@/models/RecoveryTime";

const BALANCE_QUERY_KEY = "balance" as const;
const BALANCE_CATEGORY_QUERY_KEY = "balance-category" as const;

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

export const useBalanceMonthlyEvolution = (year: number) =>
  useQuery({
    queryKey: ["balance", "monthly-evolution", year],
    queryFn: () => getMonthlyEvolution(year),
    enabled: !!year,
    refetchOnMount: "always",
  });

/**
 * Calcula cuántos meses tardarías en recuperarte de un gasto según tu
 * ahorro promedio de los últimos N meses cerrados. Solo se dispara cuando
 * `params` no es null (el usuario ya completó y envió el formulario).
 */
export const useRecoveryTime = (params: RecoveryTimeParams | null) =>
  useQuery({
    queryKey: ["balance", "recovery-time", params],
    queryFn: () => getRecoveryTime(params as RecoveryTimeParams),
    enabled: params !== null,
  });
