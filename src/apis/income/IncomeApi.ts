import type { Income, IncomeAddPayload } from "../../models/Income";
import { api } from "../axios";

export const getAllIncomes = () =>
  api.get<Income[]>("/income").then((response) => response.data);

export const deleteIncome = (id: number) =>
  api.delete(`/income/${id}`).then((response) => response.data);

export const addIncome = (incomeToAdd: IncomeAddPayload) =>
  api.post("/income", incomeToAdd).then((response) => response.data);

export const reloadIncome = (id: number) =>
  api.post(`/income/${id}/reload`).then((response) => response.data);
