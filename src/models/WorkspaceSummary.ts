export interface WorkspaceSummaryComparacion {
  totalIngresadoMesAnterior: number;
  totalGastadoMesAnterior: number;
  diferenciaIngreso: number;
  diferenciaGasto: number;
}

export interface WorkspaceSummaryPorMoneda {
  currency: string;
  totalIngresado: number;
  totalGastado: number;
  diferencia: number;
  categoriaConMayorGasto: string | null;
  comparacionVsMesAnterior: WorkspaceSummaryComparacion;
}

export interface WorkspaceSummaryTotalUSD {
  totalIngresado: number;
  totalGastado: number;
  diferencia: number;
  comparacionVsMesAnterior: WorkspaceSummaryComparacion;
}

export interface WorkspaceSummary {
  year: number;
  month: number;
  porMoneda: WorkspaceSummaryPorMoneda[];
  totalUnificadoUSD: WorkspaceSummaryTotalUSD;
}
