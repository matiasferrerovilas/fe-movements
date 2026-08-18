import type { Income, IncomeAddPayload } from "@/models/Income";
import type { PageResponse } from "@/models/BaseMode";
import { api } from "@/apis/axios";

// El listado de ingresos configurados por un usuario es siempre chico (unas pocas fuentes
// de ingreso, no miles de movimientos) y esta pantalla no tiene UI de paginación — así que
// se pide todo en una sola página en vez de construir controles de paginación para una lista
// que en la práctica nunca los va a necesitar.
const FETCH_ALL_PAGE_SIZE = 1000;

export const getAllIncomes = () =>
  api
    .get<PageResponse<Income>>("/income", { params: { size: FETCH_ALL_PAGE_SIZE } })
    .then((response) => response.data.content);

export const deleteIncome = (id: number) =>
  api.delete(`/income/${id}`).then((response) => response.data);

export const addIncome = (incomeToAdd: IncomeAddPayload) =>
  api.post("/income", incomeToAdd).then((response) => response.data);

export const reloadIncome = (id: number) =>
  api.post(`/income/${id}/reload`).then((response) => response.data);
