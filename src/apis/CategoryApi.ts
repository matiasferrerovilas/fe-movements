import type { Category } from "../models/Category";
import { api } from "./axios";

const BASE_PATH = "workspace";

/**
 * Obtiene las categorías activas del workspace activo del usuario.
 * GET /workspace/categories
 */
export const getCategoriesApi = () =>
  api
    .get<Category[]>(`/${BASE_PATH}/categories`)
    .then((response) => response.data);

/**
 * Agrega una categoría al workspace activo del usuario.
 * POST /workspace/categories?description=NOMBRE
 */
export const addCategoryApi = (description: string) =>
  api
    .post<Category>(`/${BASE_PATH}/categories`, null, {
      params: { description },
    })
    .then((response) => response.data);

/**
 * Desactiva una categoría del workspace activo del usuario.
 * DELETE /workspace/categories/{categoryId}
 */
export const deleteCategoryApi = (categoryId: number) =>
  api
    .delete(`/${BASE_PATH}/categories/${categoryId}`)
    .then((response) => response.data);

export interface MigrateCategoryPayload {
  fromCategoryId: number;
  toCategoryId: number;
}

/**
 * Migra movimientos de una categoría a otra dentro del workspace activo.
 * PATCH /workspace/categories/migrate
 * Solo disponible para ADMIN.
 */
export const migrateCategoryApi = (payload: MigrateCategoryPayload) =>
  api
    .patch<void>(`/${BASE_PATH}/categories/migrate`, payload)
    .then((response) => response.data);

export interface UpdateCategoryPayload {
  description?: string;
  iconName?: string | null;
  iconColor?: string | null;
}

/**
 * Actualiza una categoría del workspace activo del usuario.
 * PATCH /workspace/categories/{categoryId}
 */
export const updateCategoryApi = (
  categoryId: number,
  payload: UpdateCategoryPayload,
) =>
  api
    .patch<Category>(`/${BASE_PATH}/categories/${categoryId}`, payload)
    .then((response) => response.data);
