export interface WorkspaceSummaryComparacion {
  ingresadoMesAnterior: number;
  gastadoMesAnterior: number;
  diferenciaIngresado: number;
  diferenciaGastado: number;
}

export interface WorkspaceSummaryPorMoneda {
  currency: string;
  ingresado: number;
  gastado: number;
  diferencia: number;
  categoriaConMayorGasto: string | null;
  comparacion: WorkspaceSummaryComparacion;
}

export interface WorkspaceSummaryTotalUSD {
  ingresado: number;
  gastado: number;
  diferencia: number;
}

export interface WorkspaceSummary {
  year: number;
  month: number;
  porMoneda: WorkspaceSummaryPorMoneda[];
  totalUnificadoUSD: WorkspaceSummaryTotalUSD;
}
