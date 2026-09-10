export interface WorkspaceSummaryComparison {
  previousMonthIncome: number;
  previousMonthSpent: number;
  spentDelta: number;
  incomeDelta: number;
}

export interface WorkspaceSummaryPerCurrency {
  currency: string;
  movementCount: number;
  totalIncome: number;
  totalSpent: number;
  totalSpentDebit: number;
  totalSpentCredit: number;
  net: number;
  topSpendingCategory: string | null;
  vsPreviousMonth: WorkspaceSummaryComparison;
}

export interface WorkspaceSummaryUserPerCurrency {
  currency: string;
  movementCount: number;
  totalSpent: number;
}

// Espeja MonthlySummaryUserRecord (api-movements). Solo trae usuarios con al menos un movimiento.
export interface WorkspaceSummaryUser {
  userId: number;
  name: string;
  perCurrency: WorkspaceSummaryUserPerCurrency[];
}

export interface WorkspaceSummaryTotalUsd {
  totalIncome: number;
  totalSpent: number;
  totalSpentDebit: number;
  totalSpentCredit: number;
  net: number;
  vsPreviousMonth: WorkspaceSummaryComparison;
}

export interface WorkspaceSummary {
  year: number;
  month: number;
  perCurrency: WorkspaceSummaryPerCurrency[];
  totalUsd: WorkspaceSummaryTotalUsd;
}
