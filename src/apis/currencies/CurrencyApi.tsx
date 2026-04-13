import { api } from "../axios";
import type { Currency } from "../../models/Currency";

export async function getAllCurrencies() {
  return api
    .get<Currency[]>("/currency")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching currencies:", error);
      throw error;
    });
}