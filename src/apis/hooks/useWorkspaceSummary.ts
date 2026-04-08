import { useQuery } from "@tanstack/react-query";
import { getWorkspaceMonthlySummary } from "../workspace/WorkspaceSummaryApi";

export const WORKSPACE_SUMMARY_QUERY_KEY = "workspace-monthly-summary" as const;

export const useWorkspaceSummary = (year: number, month: number) =>
  useQuery({
    queryKey: [WORKSPACE_SUMMARY_QUERY_KEY, year, month],
    queryFn: () => getWorkspaceMonthlySummary(0, year, month),
    staleTime: 1000 * 60,
  });
