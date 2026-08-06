import { api } from "@/apis/axios";
import type { Currency } from "@/models/Currency";

const BASE_PATH = "workspace";

/**
 * Obtiene las monedas visibles para el workspace activo del usuario
 * (catálogo global + las propias del workspace).
 * GET /workspace/currencies
 */
export const getAllCurrencies = () =>
  api
    .get<Currency[]>(`/${BASE_PATH}/currencies`)
    .then((response) => response.data);

export interface AddCurrencyPayload {
  symbol: string;
  description: string;
}

/**
 * Agrega una moneda al workspace activo del usuario.
 * POST /workspace/currencies
 */
export const addCurrency = (payload: AddCurrencyPayload): Promise<Currency> =>
  api
    .post<Currency>(`/${BASE_PATH}/currencies`, payload)
    .then((response) => response.data);

/**
 * Elimina una moneda del workspace activo del usuario.
 * DELETE /workspace/currencies/{currencyId}
 */
export const deleteCurrency = (id: number): Promise<void> =>
  api.delete(`/${BASE_PATH}/currencies/${id}`).then(() => undefined);
