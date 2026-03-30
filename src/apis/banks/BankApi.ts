import { api } from "../axios";
import type { BankRecord } from "../../models/Bank";

export async function getAllBanks() {
  return api
    .get<BankRecord[]>("/banks")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching banks:", error);
      throw error;
    });
}

export async function addBank(description: string): Promise<BankRecord> {
  return api
    .post<BankRecord>("/banks", { description })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding bank:", error);
      throw error;
    });
}

export async function deleteBank(id: number): Promise<void> {
  return api
    .delete(`/banks/${id}`)
    .then(() => undefined)
    .catch((error) => {
      console.error("Error deleting bank:", error);
      throw error;
    });
}
