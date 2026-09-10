import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaceMonthlySummary,
  getWorkspaceMonthlySummaryByUser,
  markMonthlySummarySeen,
} from "@/apis/workspace/WorkspaceSummaryApi";
import { CURRENT_USER_QUERY_KEY } from "@/apis/hooks/useCurrentUser";

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

// `enabled` para pedir el desglose por usuario recién cuando se abre esa pestaña.
export const useWorkspaceSummaryByUser = (
  workspaceId: number | null,
  year: number,
  month: number,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [WORKSPACE_SUMMARY_QUERY_KEY, "by-user", workspaceId, year, month],
    queryFn: () => getWorkspaceMonthlySummaryByUser(workspaceId!, year, month),
    staleTime: 1000 * 60,
    enabled: enabled && workspaceId !== null,
  });

// Descarta el cierre de mes. Al invalidar /users/me, el guard del root re-evalúa
// pendingMonthlySummary (ahora null) y deja pasar a la app normal.
export const useMarkMonthlySummarySeen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      year,
      month,
    }: {
      workspaceId: number;
      year: number;
      month: number;
    }) => markMonthlySummarySeen(workspaceId, year, month),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
};
