import type { CurrencyEnum } from "../enums/CurrencyEnum";

export type BalanceFilters = {
  currency: CurrencyEnum;
  year?: number;
  month?: number;
  dates: [Date, Date];
};
