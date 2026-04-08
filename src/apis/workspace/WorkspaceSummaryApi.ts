import type { WorkspaceSummary } from "../../models/WorkspaceSummary";
import { api } from "../axios";

export async function getWorkspaceMonthlySummary(
  workspaceId: number,
  year: number,
  month: number,
): Promise<WorkspaceSummary> {
  return api
    .get<WorkspaceSummary>(`workspaces/${workspaceId}/summary/monthly`, {
      params: { year, month },
    })
    .then((r) => r.data)
    .catch((error) => {
      console.error("Error fetching workspace monthly summary:", error);
      throw error;
    });
}
