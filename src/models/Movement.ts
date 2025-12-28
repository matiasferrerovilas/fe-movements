import type { Dayjs } from "dayjs";
import type { Category } from "./Category";
import type { Currency } from "./Currency";
import type { AccountWithoutMembers } from "./UserGroup";
import type { User } from "./User";

export interface Movement {
  id: number;
  amount: number;
  description: string;
  date: string;
  owner: User;
  bank: string;
  category: Category | null;
  currency: Currency | null;
  type: string;
  cuotasTotales: number | null;
  cuotaActual: number | null;
  account: AccountWithoutMembers;
}

export interface CreateMovementForm {
  bank: string;
  description: string;
  date: Dayjs;
  currency: string;
  amount: number;
  type: string;
  cuotaActual?: number;
  cuotasTotales?: number;
  category?: string;
  accountId: number;
}
