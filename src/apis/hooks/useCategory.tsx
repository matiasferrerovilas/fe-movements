import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  migrateCategoryApi,
  type MigrateCategoryPayload,
} from "../CategoryApi";

const CATEGORIES_QUERY_KEY = "categories" as const;

export const useCategory = () =>
  useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: () => getCategoriesApi(),
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      data.map((cat) => ({
        ...cat,
        description:
          cat.description.charAt(0).toUpperCase() +
          cat.description.slice(1).toLowerCase(),
      })),
  });

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => addCategoryApi(description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
};

export const useMigrateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MigrateCategoryPayload) =>
      migrateCategoryApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["movement-history"] });
    },
  });
};
