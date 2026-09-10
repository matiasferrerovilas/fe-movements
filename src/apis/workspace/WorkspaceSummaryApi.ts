import type {
  WorkspaceSummary,
  WorkspaceSummaryUser,
} from "@/models/WorkspaceSummary";
import { api } from "@/apis/axios";

export const getWorkspaceMonthlySummary = (
  workspaceId: number,
  year: number,
  month: number,
): Promise<WorkspaceSummary> =>
  api
    .get<WorkspaceSummary>(`/workspaces/${workspaceId}/summary/monthly`, {
      params: { year, month },
    })
    .then((r) => r.data);

// Desglose "por usuario" — solo miembros con al menos un movimiento ese mes.
export const getWorkspaceMonthlySummaryByUser = (
  workspaceId: number,
  year: number,
  month: number,
): Promise<WorkspaceSummaryUser[]> =>
  api
    .get<WorkspaceSummaryUser[]>(
      `/workspaces/${workspaceId}/summary/monthly/by-user`,
      { params: { year, month } },
    )
    .then((r) => r.data);

// Marca el cierre de ese mes como visto para el usuario autenticado. A partir de acá,
// GET /users/me deja de devolverlo en metadata.pendingMonthlySummary.
export const markMonthlySummarySeen = (
  workspaceId: number,
  year: number,
  month: number,
): Promise<void> =>
  api
    .post(`/workspaces/${workspaceId}/summary/monthly/${year}/${month}/seen`)
    .then(() => undefined);
