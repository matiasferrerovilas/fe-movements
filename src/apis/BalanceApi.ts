import dayjs from "dayjs";
import type {
  BalanceResponse,
  MonthlyEvolutionRecord,
} from "@/models/Balance";
import type { BalanceByCategory } from "@/models/BalanceByCategory";
import type { BalanceFilters } from "@/models/BalanceFilters";
import type {
  RecoveryTimeParams,
  RecoveryTimeRecord,
} from "@/models/RecoveryTime";
import { api } from "@/apis/axios";

const formatDate = (date: Date) => dayjs(date).format("YYYY-MM-DD");

export const getBalance = (filters: BalanceFilters) => {
  const params = new URLSearchParams();

  if (filters.year) params.set("year", String(filters.year));
  if (filters.month) params.set("month", String(filters.month));
  if (filters.currency?.length)
    params.set("currencies", String(filters.currency));
  if (filters.dates) {
    params.set("startDate", formatDate(filters.dates[0]));
    params.set("endDate", formatDate(filters.dates[1]));
  }

  return api
    .get<BalanceResponse>("/balance", {
      params,
      paramsSerializer: () => params.toString(),
    })
    .then((response) => response.data);
};

export const getBalanceWithCategoryByYear = (filters: BalanceFilters) => {
  const params = new URLSearchParams();
  if (filters.dates) {
    params.set("startDate", formatDate(filters.dates[0]));
    params.set("endDate", formatDate(filters.dates[1]));
  }

  if (filters.currency?.length)
    params.set("currencies", String(filters.currency));

  return api
    .get<BalanceByCategory[]>("/balance/category", { params })
    .then((response) => response.data);
};

export const getMonthlyEvolution = (
  year: number,
): Promise<MonthlyEvolutionRecord[]> =>
  api
    .get<MonthlyEvolutionRecord[]>("/balance/monthly-evolution", {
      params: { year },
    })
    .then((res) => res.data);

export const getRecoveryTime = (
  params: RecoveryTimeParams,
): Promise<RecoveryTimeRecord> =>
  api
    .get<RecoveryTimeRecord>("/balance/recovery-time", {
      params: {
        amount: params.amount,
        currency: params.currency,
        months: params.months,
      },
    })
    .then((res) => res.data);
