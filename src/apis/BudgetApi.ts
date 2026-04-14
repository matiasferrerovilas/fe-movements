import type { BudgetRecord, BudgetToAdd, BudgetToUpdate, BudgetQueryParams } from "../models/Budget";
import { api } from "./axios";

const BASE_PATH = "budgets";

export const getBudgetsApi = (params: BudgetQueryParams) =>
  api.get<BudgetRecord[]>(BASE_PATH, { params }).then((response) => response.data);

export const addBudgetApi = (payload: BudgetToAdd) =>
  api.post<void>(BASE_PATH, payload).then((response) => response.data);

export const updateBudgetApi = (id: number, payload: BudgetToUpdate) =>
  api.patch<void>(`${BASE_PATH}/${id}`, payload).then((response) => response.data);

export const deleteBudgetApi = (id: number) =>
  api.delete<void>(`${BASE_PATH}/${id}`).then((response) => response.data);
