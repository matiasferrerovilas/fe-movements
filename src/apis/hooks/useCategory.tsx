import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  migrateCategoryApi,
  updateCategoryApi,
  type MigrateCategoryPayload,
  type UpdateCategoryPayload,
} from "../CategoryApi";

const CATEGORIES_QUERY_KEY = "categories" as const;

/**
 * Hook para obtener categorías del workspace activo del usuario.
 * El backend determina el workspace automáticamente desde DEFAULT_WORKSPACE.
 */
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

export interface AddCategoryParams {
  description: string;
}

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ description }: AddCategoryParams) =>
      addCategoryApi(description),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
  });
};

export interface DeleteCategoryParams {
  categoryId: number;
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId }: DeleteCategoryParams) =>
      deleteCategoryApi(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
  });
};

export const useMigrateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MigrateCategoryPayload) => migrateCategoryApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: ["movement-history"] });
    },
  });
};

export interface UpdateCategoryParams {
  categoryId: number;
  payload: UpdateCategoryPayload;
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, payload }: UpdateCategoryParams) =>
      updateCategoryApi(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: ["movement-history"] });
    },
  });
};
