import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMonthlySummary } from "../workspace/WorkspaceSummaryApi";

export const WORKSPACE_SUMMARY_QUERY_KEY = "workspace-monthly-summary" as const;

export const useWorkspaceSummary = (
  workspaceId: number | null,
  year: number,
  month: number,
) =>
  useQuery({
    queryKey: [WORKSPACE_SUMMARY_QUERY_KEY, workspaceId, year, month],
    queryFn: () => getWorkspaceMonthlySummary(workspaceId!, year, month),
    staleTime: 1000 * 60,
    enabled: workspaceId !== null,
  });
