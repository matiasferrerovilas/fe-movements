import dayjs from "dayjs";
import type { MovementFilters } from "../../routes/movement";
import type { PageResponse } from "../../models/BaseMode";
import type { CreateMovementForm, Movement } from "../../models/Movement";
import type { UploadPayload } from "../../components/modals/movements/ImportMovementTab";
import { api } from "../axios";

type ParamsValue = string | number | boolean | undefined | null;
type ParamsObject = Record<string, ParamsValue | ParamsValue[]>;

export const getExpenseApi = ({
  page = 0,
  size,
  filters,
}: {
  page?: number;
  size?: number;
  filters?: MovementFilters;
}) => {
  const params: ParamsObject = {
    page,
    size,
    ...(filters || {}),
  };

  Object.keys(params).forEach(
    (key) => params[key] == null && delete params[key],
  );

  return api
    .get<PageResponse<Movement>>("/expenses", {
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      },
    })
    .then((res) => res.data);
};

export const uploadExpenseApi = async (form: UploadPayload) => {
  if (form.file == null || form.bank == null) {
    throw new Error("Missing required fields: file or bank");
  }

  const formData = new FormData();
  formData.append("file", form.file);
  formData.append("bank", form.bank);

  const response = await api.post("/expenses/import-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateExpense = (id: number, movement: CreateMovementForm) => {
  const payload = {
    ...movement,
    category: movement.category
      ? { description: movement.category }
      : undefined,
    date: dayjs(movement.date).format("YYYY-MM-DD"),
  };
  return api.patch(`/expenses/${id}`, payload).then((response) => response.data);
};

export const uploadExpense = (movement: CreateMovementForm) => {
  const payload = {
    ...movement,
    date: dayjs(movement.date).format("YYYY-MM-DD"),
  };
  return api.post("/expenses", payload).then((response) => response.data);
};

export const deleteExpenseApi = (id: number) =>
  api.delete(`/expenses/${id}`).then((response) => response.data);

export const deleteAllMovements = () =>
  api.delete("/expenses/all").then((response) => response.data);
