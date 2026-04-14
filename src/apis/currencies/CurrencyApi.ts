import { api } from "../axios";
import type { Currency } from "../../models/Currency";

export const getAllCurrencies = () =>
  api.get<Currency[]>("/currency").then((response) => response.data);
