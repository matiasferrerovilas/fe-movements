import type {
  GoalContribution,
  GoalRecord,
  GoalToAdd,
  GoalToUpdate,
} from "@/models/Goal";
import { api } from "@/apis/axios";

const BASE_PATH = "goals";

export const getGoalsApi = (workspaceId: number) =>
  api
    .get<GoalRecord[]>(BASE_PATH, { params: { workspaceId } })
    .then((response) => response.data);

export const addGoalApi = (payload: GoalToAdd) =>
  api.post<GoalRecord>(BASE_PATH, payload).then((response) => response.data);

export const updateGoalApi = (id: number, payload: GoalToUpdate) =>
  api
    .patch<GoalRecord>(`${BASE_PATH}/${id}`, payload)
    .then((response) => response.data);

export const contributeGoalApi = (id: number, payload: GoalContribution) =>
  api
    .patch<GoalRecord>(`${BASE_PATH}/${id}/contribute`, payload)
    .then((response) => response.data);

export const deleteGoalApi = (id: number) =>
  api.delete<void>(`${BASE_PATH}/${id}`).then((response) => response.data);
