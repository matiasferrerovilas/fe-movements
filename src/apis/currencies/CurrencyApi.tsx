import { api } from "../axios";

export interface Currency {
  symbol: string;
  description: string;
  id: number;
}

export async function getAllCurrencies() {
  return api
    .get<Currency[]>("/currency")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching currencies:", error);
      throw error;
    });
}