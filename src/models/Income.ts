import type { Currency, CurrencyRecord } from "./Currency";
import type { UserGroup } from "./UserGroup";

export interface Income {
  id: number;
  amount: number;
  bank: string;
  currency: Currency | null;
  groups: UserGroup;
}

export interface IncomeAddForm {
  amount: number;
  bank: string;
  group: string;
  currency: CurrencyRecord;
}
