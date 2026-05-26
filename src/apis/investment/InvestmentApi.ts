import dayjs from "dayjs";
import type { Investment, CreateInvestmentForm, UpdateInvestmentForm } from "../../models/Investment";
import type { InvestmentType } from "../../models/InvestmentType";
import { api } from "../axios";

const BASE_PATH = "/investments";
const TYPES_PATH = "/investment-types";

export const getInvestmentsApi = (accountId: number) =>
  api
    .get<Investment[]>(BASE_PATH, { params: { accountId } })
    .then((r) => r.data);

export const createInvestmentApi = (form: CreateInvestmentForm, accountId: number) => {
  const payload = {
    ...form,
    fechaInversion: dayjs(form.fechaInversion).format("YYYY-MM-DD"),
    accountId,
  };
  return api.post<Investment>(BASE_PATH, payload).then((r) => r.data);
};

export const updateInvestmentApi = (id: number, form: UpdateInvestmentForm) => {
  const payload = {
    ...form,
    ...(form.fechaInversion && {
      fechaInversion: dayjs(form.fechaInversion).format("YYYY-MM-DD"),
    }),
  };
  return api.put<Investment>(`${BASE_PATH}/${id}`, payload).then((r) => r.data);
};

export const deleteInvestmentApi = (id: number) =>
  api.delete(`${BASE_PATH}/${id}`).then((r) => r.data);

export const getInvestmentTypesApi = () =>
  api.get<InvestmentType[]>(TYPES_PATH).then((r) => r.data);
