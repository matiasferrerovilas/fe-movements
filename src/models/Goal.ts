import type { CurrencySymbol } from "@/models/Budget";

export interface GoalRecord {
  id: number;
  workspaceId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencySymbol;
  targetDate: string | null;
  progressPercent: number;
  createdAt: string;
}

export interface GoalToAdd {
  workspaceId: number;
  name: string;
  targetAmount: number;
  currency: string;
  targetDate: string | null;
}

export interface GoalToUpdate {
  name?: string;
  targetAmount?: number;
  targetDate?: string | null;
}

export interface GoalContribution {
  amount: number;
}
