import { api } from "../axios";
import type { BankRecord } from "../../models/Bank";

export const getAllBanks = () =>
  api.get<BankRecord[]>("/banks").then((response) => response.data);

export const addBank = (description: string): Promise<BankRecord> =>
  api.post<BankRecord>("/banks", { description }).then((response) => response.data);

export const deleteBank = (id: number): Promise<void> =>
  api.delete(`/banks/${id}`).then(() => undefined);
