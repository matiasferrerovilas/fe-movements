export interface ProjectedPoint {
  monthsOut: number;
  projectedBalance: number;
}

export interface ProjectionResponse {
  currentBalance: number;
  averageMonthlyNet: number;
  trailingMonths: number;
  projectedPoints: ProjectedPoint[];
}
