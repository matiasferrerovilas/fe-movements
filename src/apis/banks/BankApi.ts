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
