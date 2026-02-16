import dayjs from "dayjs";
import type { BalanceResponse } from "../models/Balance";
import type {
  BalanceByCategory,
  BalanceByGroup,
} from "../models/BalanceByCategory";
import type { BalanceFilters } from "../routes/balance";
import { api } from "./axios";

const formatDate = (date: Date) => dayjs(date).format("YYYY-MM-DD");

export async function getBalance(filters: BalanceFilters) {
  try {
    const params = new URLSearchParams();

    if (filters.year) params.set("year", String(filters.year));
    if (filters.month) params.set("month", String(filters.month));
    if (filters.currency?.length)
      params.set("currencies", String(filters.currency));
    filters.account?.forEach((g) => params.append("groups", String(g)));
    if (filters.dates) {
      params.set("startDate", formatDate(filters.dates[0]));
      params.set("endDate", formatDate(filters.dates[1]));
    }

    console.log("Fetching balance with params:", params.toString());
    const { data } = await api.get<BalanceResponse>("/balance", {
      params,
      paramsSerializer: () => params.toString(),
    });

    return data;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

export async function getBalanceWithCategoryByYear(filters: BalanceFilters) {
  const params = new URLSearchParams();

  if (filters.year) params.append("year", String(filters.year));
  if (filters.month) params.append("month", String(filters.month));

  // currencies: string[]
  if (filters.currency?.length)
    params.set("currencies", String(filters.currency));

  // groups: number[]
  if (filters.account?.length) {
    filters.account.forEach((g) => params.append("groups", String(g)));
  }

  return api
    .get<BalanceByCategory[]>("/balance/category", { params })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching balances:", error);
      throw error;
    });
}

export async function getBalanceWithGroupByYearAndMonth({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  return api
    .get<BalanceByGroup[]>("/balance/group", {
      params: { year, month },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching balances:", error);
      throw error;
    });
}
