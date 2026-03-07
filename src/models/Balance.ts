export interface Balance {
  balance: number;
  symbol: string;
  year: number;
  month: number;
  type: string;
}

export interface BalanceResponse {
  GASTO: number;
  INGRESO: number;
}

export type MonthlyEvolutionRecord = {
  month: number;
  currencySymbol: string;
  total: number;
};
