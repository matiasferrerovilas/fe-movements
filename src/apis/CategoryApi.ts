import type { Category } from "../models/Category";
import { api } from "./axios";

export async function getCategoriesApi() {
  return api
    .get<Category[]>("/categories")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching expenses:", error);
      throw error;
    });
}

export async function addCategoryApi(description: string) {
  return api
    .post<Category>("/categories", null, { params: { description } })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding category:", error);
      throw error;
    });
}

export async function deleteCategoryApi(id: number) {
  return api
    .delete(`/categories/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting category:", error);
      throw error;
    });
}

export interface MigrateCategoryPayload {
  fromCategoryId: number;
  toCategoryId: number;
}

export async function migrateCategoryApi(payload: MigrateCategoryPayload) {
  return api
    .patch<void>("/categories/migrate", payload)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error migrating category:", error);
      throw error;
    });
}
