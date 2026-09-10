export interface WorkspaceSummaryComparison {
  previousMonthIncome: number;
  previousMonthSpent: number;
  spentDelta: number;
  incomeDelta: number;
}

export interface WorkspaceSummaryPerCurrency {
  currency: string;
  totalIncome: number;
  totalSpent: number;
  totalSpentDebit: number;
  totalSpentCredit: number;
  net: number;
  topSpendingCategory: string | null;
  vsPreviousMonth: WorkspaceSummaryComparison;
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
