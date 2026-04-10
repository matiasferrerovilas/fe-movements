import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Membership } from "../../../../src/models/UserGroup";
import type { Category } from "../../../../src/models/Category";
import type { UserSetting } from "../../../../src/models/UserSetting";
import type { Movement } from "../../../../src/models/Movement";
import type { BankRecord } from "../../../../src/models/Bank";
import type { Currency } from "../../../../src/apis/currencies/CurrencyApi";
import AddMovementExpenseTab from "../../../../src/components/modals/movements/AddMovementExpenseTab";

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockMemberships: Membership[] = [
  { accountId: 10, membershipId: 1, groupDescription: "Familia", role: "ADMIN" },
  { accountId: 20, membershipId: 2, groupDescription: "Personal", role: "FAMILY" },
];

const mockCategories: Category[] = [
  { id: 1, description: "Supermercado", isActive: true, isDeletable: false },
  { id: 2, description: "Transporte", isActive: true, isDeletable: true },
];

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso argentino" },
  { id: 2, symbol: "USD", description: "Dólar" },
];

const mockBanks: BankRecord[] = [
  { id: 1, description: "GALICIA" },
  { id: 2, description: "SANTANDER" },
];

const defaultAccountSetting: UserSetting = { key: "DEFAULT_ACCOUNT", value: 10 };
const defaultBankSetting: UserSetting = { key: "DEFAULT_BANK", value: 1 };
const defaultCurrencySetting: UserSetting = { key: "DEFAULT_CURRENCY", value: 1 };

const mockMovementToEdit: Movement = {
  id: 99,
  amount: 1500,
  description: "Supermercado Dia",
  date: "2024-03-15",
  owner: { id: 1, email: "test@test.com" },
  bank: "GALICIA",
  category: { id: 1, description: "Supermercado", isActive: true, isDeletable: false },
  currency: { id: 1, symbol: "ARS", code: "ARS", name: "Peso argentino" },
  type: "DEBITO",
  cuotasTotales: null,
  cuotaActual: null,
  account: { id: 10, name: "Familia" },
};

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/account/membership", () =>
    HttpResponse.json(mockMemberships),
  ),
  http.get("http://localhost:8080/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.get("http://localhost:8080/currency", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/banks", () =>
    HttpResponse.json(mockBanks),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_ACCOUNT", () =>
    HttpResponse.json(defaultAccountSetting),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_BANK", () =>
    HttpResponse.json(defaultBankSetting),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json(defaultCurrencySetting),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

function renderTab(props: React.ComponentProps<typeof AddMovementExpenseTab> = {}) {
  const { wrapper, queryClient } = makeWrapper();
  const result = render(
    <AddMovementExpenseTab ref={null} {...props} />,
    { wrapper },
  );
  return { ...result, queryClient };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AddMovementExpenseTab", () => {
  describe("render inicial", () => {
    it("muestra el campo Banco", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Banco")).toBeInTheDocument(),
      );
    });

    it("muestra el campo Tipo", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Tipo")).toBeInTheDocument(),
      );
    });

    it("muestra el campo Descripción", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Descripción")).toBeInTheDocument(),
      );
    });

    it("muestra el campo Categoría", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Categoría")).toBeInTheDocument(),
      );
    });

    it("muestra el campo Fecha", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Fecha")).toBeInTheDocument(),
      );
    });

    it("muestra el campo Moneda", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Moneda")).toBeInTheDocument(),
      );
    });

    it("muestra el campo Monto", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Monto")).toBeInTheDocument(),
      );
    });

    it("el DatePicker muestra la fecha de hoy en formato DD/MM/YYYY", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Fecha")).toBeInTheDocument(),
      );
      const dateInput = document.querySelector<HTMLInputElement>(
        ".ant-picker-input input",
      );
      expect(dateInput).not.toBeNull();
      // El valor por defecto es la fecha de hoy formateada como DD/MM/YYYY
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      expect(dateInput?.value).toBe(`${dd}/${mm}/${yyyy}`);
    });

    it("no muestra los campos de cuotas para tipo no CREDITO", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Fecha")).toBeInTheDocument(),
      );
      expect(screen.queryByText("Cuota Actual")).not.toBeInTheDocument();
      expect(screen.queryByText("Cuotas Totales")).not.toBeInTheDocument();
    });
  });

  describe("modo edición (movementToEdit)", () => {
    it("precarga la descripción del movimiento a editar", async () => {
      renderTab({ movementToEdit: mockMovementToEdit });
      await waitFor(() =>
        expect(
          screen.getByDisplayValue("Supermercado Dia"),
        ).toBeInTheDocument(),
      );
    });

    it("precarga el monto del movimiento a editar", async () => {
      renderTab({ movementToEdit: mockMovementToEdit });
      await waitFor(() => {
        // InputNumber de Ant Design formatea el número con separadores
        const amountInput = document.querySelector<HTMLInputElement>(
          "#amount",
        );
        expect(amountInput?.value).toBe("1500.00");
      });
    });

    it("precarga la fecha del movimiento a editar en formato DD/MM/YYYY", async () => {
      renderTab({ movementToEdit: mockMovementToEdit });
      await waitFor(() => {
        const dateInput = document.querySelector<HTMLInputElement>(
          ".ant-picker-input input",
        );
        expect(dateInput?.value).toBe("15/03/2024");
      });
    });
  });

  describe("campos condicionales de crédito", () => {
    it("no muestra campos de cuotas inicialmente", async () => {
      renderTab();
      await waitFor(() =>
        expect(screen.getByText("Fecha")).toBeInTheDocument(),
      );
      expect(screen.queryByText("Cuota Actual")).not.toBeInTheDocument();
      expect(screen.queryByText("Cuotas Totales")).not.toBeInTheDocument();
    });
  });
});
