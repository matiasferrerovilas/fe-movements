import type { BudgetRecord, BudgetToAdd, BudgetToUpdate, BudgetQueryParams } from "../models/Budget";
import { api } from "./axios";

const BASE_PATH = "budgets";

export async function getBudgetsApi(params: BudgetQueryParams) {
  return api
    .get<BudgetRecord[]>(BASE_PATH, { params })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching budgets:", error);
      throw error;
    });
}

export async function addBudgetApi(payload: BudgetToAdd) {
  return api
    .post<void>(BASE_PATH, payload)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding budget:", error);
      throw error;
    });
}

export async function updateBudgetApi(id: number, payload: BudgetToUpdate) {
  return api
    .patch<void>(`${BASE_PATH}/${id}`, payload)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating budget:", error);
      throw error;
    });
}

export async function deleteBudgetApi(id: number) {
  return api
    .delete<void>(`${BASE_PATH}/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting budget:", error);
      throw error;
    });
}
