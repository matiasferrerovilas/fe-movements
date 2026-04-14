import type { WorkspaceSummary } from "../../models/WorkspaceSummary";
import { api } from "../axios";

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
