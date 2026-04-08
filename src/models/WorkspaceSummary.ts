export interface WorkspaceSummaryComparison {
  totalIngresadoMesAnterior: number;
  totalGastadoMesAnterior: number;
  diferenciaGasto: number;
  diferenciaIngreso: number;
}

export interface WorkspaceSummary {
  year: number;
  month: number;
  totalIngresado: number;
  totalGastado: number;
  diferencia: number;
  categoriaConMayorGasto: string | null;
  comparacionVsMesAnterior: WorkspaceSummaryComparison;
}
