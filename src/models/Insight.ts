export type InsightDirection = "ABOVE" | "BELOW";

export interface CategoryInsight {
  category: string;
  currency: string;
  currentAmount: number;
  averageAmount: number;
  percentDeviation: number;
  direction: InsightDirection;
}
