export interface RecoveryTimeParams {
  amount: number;
  currency: string;
  months?: number;
}

export interface RecoveryTimeRecord {
  monto: number;
  moneda: string;
  mesesConsiderados: number;
  ahorroPromedioMensual: number;
  mesesParaRecuperar: number | null;
  recuperable: boolean;
}
