import type { Currency, CurrencyRecord } from "./Currency";

export interface Income {
  id: number;
  amount: number;
  bank: string;
  currency: Currency | null;
  accountName: string;
}

export interface IncomeAddForm {
  amount: number;
  bank: string;
  group: string;
  currency: string;
}

export interface IncomeAddPayload {
  amount: number;
  bank: string;
  group: string;
  currency: CurrencyRecord;
}
