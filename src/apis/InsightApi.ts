import type { CategoryInsight } from "@/models/Insight";
import { api } from "@/apis/axios";

export const getInsightsApi = (workspaceId: number) =>
  api
    .get<CategoryInsight[]>("insights", { params: { workspaceId } })
    .then((response) => response.data);
