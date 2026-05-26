import type { Currency } from "./Currency";
import type { InvestmentType } from "./InvestmentType";
import type { AccountWithoutMembers } from "./UserWorkspace";

export interface Investment {
  id: number;
  instrumento: string;
  tipo: InvestmentType;
  montoInvertido: number;
  valorActual: number;
  fechaInversion: string;
  moneda: Currency;
  account: AccountWithoutMembers;
}

export interface CreateInvestmentForm {
  instrumento: string;
  tipoId: number;
  montoInvertido: number;
  currency: string;
  fechaInversion: Date;
}

export interface UpdateInvestmentForm {
  instrumento?: string;
  tipoId?: number;
  montoInvertido?: number;
  currency?: string;
  fechaInversion?: Date;
}
