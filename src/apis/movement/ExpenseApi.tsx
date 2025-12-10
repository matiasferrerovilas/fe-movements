import dayjs from "dayjs";
import type { MovementFilters } from "../../routes/movement";
import type { PageResponse } from "../../models/BaseMode";
import type { CreateMovementForm, Movement } from "../../models/Movement";
import type { UploadPayload } from "../../components/modals/movements/ImportMovementTab";
import { api } from "../axios";

type ParamsValue = string | number | boolean | undefined | null;
type ParamsObject = Record<string, ParamsValue | ParamsValue[]>;

export async function getExpenseApi({
  page = 0,
  size,
  filters,
}: {
  page?: number;
  size?: number;
  filters?: MovementFilters;
}) {
  const params: ParamsObject = {
    page,
    size,
    ...(filters || {}),
  };

  Object.keys(params).forEach(
    (key) => params[key] == null && delete params[key]
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
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching expenses:", error);
      throw error;
    });
}

export async function uploadExpenseApi(form: UploadPayload) {
  const formData = new FormData();
  if (form.file == null || form.bank == null || form.group == null) {
    return;
  }
  formData.append("file", form.file);
  formData.append("bank", form.bank);
  formData.append("group", form.group);

  const response = await api.post("/expenses/import-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function uploadExpense(movement: CreateMovementForm) {
  return api
    .post("/expenses", movement)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding a group:", error);
      throw error;
    });
}

export async function updateExpenseApi(expense: Movement) {
  const payload = {
    amount: expense.amount,
    bank: expense.bank,
    description: expense.description,
    date: expense.date ? dayjs(expense.date).format("YYYY-MM-DD") : null,
    currency: expense.currency?.symbol || null,
    type: expense.type,
    category: expense.category || null,
    cuotaActual: expense.cuotaActual ?? null,
    cuotasTotales: expense.cuotasTotales ?? null,
    year: expense.year,
    month: expense.month,
  };

  const response = await api.patch(`/expenses/${expense.id}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function deleteExpenseApi(id: number) {
  const response = await api.delete(`/expenses/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function deleteAllMovements() {
  return api
    .delete("/expenses/all")
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting all movements:", error);
      throw error;
    });
}
