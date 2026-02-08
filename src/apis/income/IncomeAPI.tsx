import type { Income, IncomeAddForm } from "../../models/Income";
import { api } from "../axios";

export async function getAllIncomes() {
  return api
    .get<Income[]>("/income")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching incomes:", error);
      throw error;
    });
}

export async function deleteIncome(id: number) {
  return api
    .delete("/income/" + id)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting the income:", error);
      throw error;
    });
}

export async function addIncome(incomeToAdd: IncomeAddForm) {
  return api
    .post("/income", incomeToAdd)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding an income:", error);
      throw error;
    });
}

export async function reloadIncome(id: number) {
  return api
    .post("/income/" + id + "/reload")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error reloading the income:", error);
      throw error;
    });
}
