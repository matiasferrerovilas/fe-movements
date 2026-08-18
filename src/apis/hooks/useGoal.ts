import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addGoalApi,
  contributeGoalApi,
  deleteGoalApi,
  getGoalsApi,
  updateGoalApi,
} from "@/apis/GoalApi";
import type { GoalContribution, GoalToAdd, GoalToUpdate } from "@/models/Goal";

export const GOALS_QUERY_KEY = "goals" as const;

export const useGoals = (workspaceId: number | null) =>
  useQuery({
    queryKey: [GOALS_QUERY_KEY, workspaceId],
    queryFn: () => getGoalsApi(workspaceId!),
    enabled: workspaceId !== null,
    staleTime: 1000 * 60,
  });

export const useAddGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalToAdd) => addGoalApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
    },
  });
};

export interface UpdateGoalVariables {
  id: number;
  payload: GoalToUpdate;
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateGoalVariables) =>
      updateGoalApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
    },
  });
};

export interface ContributeGoalVariables {
  id: number;
  payload: GoalContribution;
}

export const useContributeGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: ContributeGoalVariables) =>
      contributeGoalApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGoalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
    },
  });
};
