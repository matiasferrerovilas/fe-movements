import type { Currency } from "@/models/Currency";
import type { InvestmentType } from "@/models/InvestmentType";

export interface Investment {
  id: number;
  description: string | null;
  investmentType: InvestmentType;
  amount: number;
  startDate: string;
  endDate: string | null;
  currency: Currency;
  workspaceName: string;
  owner: string;
}

export interface CreateInvestmentForm {
  description?: string;
  investmentTypeId: number;
  amount: number;
  currencySymbol: string;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateInvestmentForm {
  description?: string;
  investmentTypeId?: number;
  amount?: number;
  currencySymbol?: string;
  startDate?: Date;
  endDate?: Date;
}
