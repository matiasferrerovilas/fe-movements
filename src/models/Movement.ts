import type { Category } from "@/models/Category";
import type { Currency } from "@/models/Currency";
import type { AccountWithoutMembers } from "@/models/UserWorkspace";
import type { User } from "@/models/User";

export interface MovementMetadata {
  owner: User;
  workspace: AccountWithoutMembers;
  exchangeRate: number;
  amountUsd: number | null;
}

export interface Movement {
  id: number;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  bank: string;
  category: Category | null;
  currency: Currency | null;
  type: string;
  cuotasTotales: number | null;
  cuotaActual: number | null;
  metadata: MovementMetadata;
}

export interface CreateMovementForm {
  bank: string;
  description: string;
  date: Date;
  currency: string;
  amount: number;
  type: string;
  cuotaActual?: number;
  cuotasTotales?: number;
  category?: string;
}
