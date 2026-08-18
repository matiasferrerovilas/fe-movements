import { useQuery } from "@tanstack/react-query";
import { getProjectionApi } from "@/apis/ProjectionApi";

export const PROJECTION_QUERY_KEY = "projection" as const;

export const useProjection = (workspaceId: number | null, months = 6) =>
  useQuery({
    queryKey: [PROJECTION_QUERY_KEY, workspaceId, months],
    queryFn: () => getProjectionApi(workspaceId!, months),
    enabled: workspaceId !== null,
    staleTime: 1000 * 60,
  });
