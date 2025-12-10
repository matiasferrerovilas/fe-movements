import type { Dayjs } from "dayjs";
import type { Category } from "./Category";
import type { Currency } from "./Currency";
import type { UserGroup } from "./UserGroup";

export interface Movement {
  id: number;
  amount: number;
  description: string;
  date: string;
  user: string;
  year: number;
  month: number;
  bank: string;
  category: Category | null;
  currency: Currency | null;
  type: string;
  cuotasTotales: number | null;
  cuotaActual: number | null;
  userGroups: UserGroup;
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
  group: string;
}
