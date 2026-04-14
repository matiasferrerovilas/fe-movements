import type { Category } from "../models/Category";
import { api } from "./axios";

export const getCategoriesApi = () =>
  api.get<Category[]>("/categories").then((response) => response.data);

export const addCategoryApi = (description: string) =>
  api
    .post<Category>("/categories", null, { params: { description } })
    .then((response) => response.data);

export const deleteCategoryApi = (id: number) =>
  api.delete(`/categories/${id}`).then((response) => response.data);

export interface MigrateCategoryPayload {
  fromCategoryId: number;
  toCategoryId: number;
}

export const migrateCategoryApi = (payload: MigrateCategoryPayload) =>
  api.patch<void>("/categories/migrate", payload).then((response) => response.data);
