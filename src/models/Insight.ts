import type { CurrencySymbol } from "@/models/Budget";

export type InsightDirection = "ABOVE" | "BELOW";

export interface CategoryInsight {
  category: string;
  currency: CurrencySymbol;
  currentAmount: number;
  averageAmount: number;
  percentDeviation: number;
  direction: InsightDirection;
}
