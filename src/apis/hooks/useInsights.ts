import { useQuery } from "@tanstack/react-query";
import { getInsightsApi } from "@/apis/InsightApi";

export const INSIGHTS_QUERY_KEY = "insights" as const;

export const useInsights = (workspaceId: number | null) =>
  useQuery({
    queryKey: [INSIGHTS_QUERY_KEY, workspaceId],
    queryFn: () => getInsightsApi(workspaceId!),
    enabled: workspaceId !== null,
    staleTime: 1000 * 60,
  });
