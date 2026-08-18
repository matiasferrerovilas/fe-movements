import type { ProjectionResponse } from "@/models/Projection";
import { api } from "@/apis/axios";

export const getProjectionApi = (workspaceId: number, months = 6) =>
  api
    .get<ProjectionResponse>("projection", { params: { workspaceId, months } })
    .then((response) => response.data);
