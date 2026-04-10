import type { Category } from "./Category";

export interface CurrencySymbol {
  id: number;
  symbol: string;
}

export interface BudgetRecord {
  id: number;
  accountId: number;
  category: Category | null;
  currency: CurrencySymbol;
  amount: number;
  year: number | null;
  month: number | null;
  spent: number;
  percentage: number;
}

export interface BudgetToAdd {
  accountId: number;
  category: string | null;
  currency: string;
  amount: number;
  year: number | null;
  month: number | null;
}

export interface BudgetToUpdate {
  amount: number;
}

export interface BudgetQueryParams {
  accountId: number;
  currency: string;
  year: number;
  month: number;
}
