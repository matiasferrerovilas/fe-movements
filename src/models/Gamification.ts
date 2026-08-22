export interface StreakRecord {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export type BadgeType = "BUDGET_MET";

export interface BadgeRecord {
  id: number;
  categoryDescription: string;
  type: BadgeType;
  year: number;
  month: number;
  earnedAt: string;
}
