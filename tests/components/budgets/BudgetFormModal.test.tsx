import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Category } from "../../../src/models/Category";
import type { Currency } from "../../../src/models/Currency";
import type { BudgetRecord } from "../../../src/models/Budget";
import {
  AddBudgetModal,
  EditBudgetModal,
} from "../../../src/components/budgets/BudgetFormModal";

// ── Mock Keycloak ─────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: { tokenParsed: { realm_access: { roles: [] } } },
    initialized: true,
  })),
}));

// ── MSW data ──────────────────────────────────────────────────────────────

const mockCategories: Category[] = [
  { id: 1, description: "HOGAR", isActive: true, isDeletable: false },
  { id: 2, description: "TRANSPORTE", isActive: true, isDeletable: true },
];

const mockCurrencies: Currency[] = [
  { id: 1, code: "ARS", name: "Peso Argentino", symbol: "ARS" },
  { id: 2, code: "USD", name: "Dólar", symbol: "USD" },
];

const mockMemberships = [
  { workspaceId: 10, workspaceName: "Familia" },
  { workspaceId: 20, workspaceName: "Personal" },
];

// ── MSW server ────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.get("http://localhost:8080/currency", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/workspace/membership", () =>
    HttpResponse.json(mockMemberships),
  ),
  http.post("http://localhost:8080/budgets", () =>
    new HttpResponse(null, { status: 201 }),
  ),
  http.patch("http://localhost:8080/budgets/:id", () =>
    new HttpResponse(null, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ───────────────────────────────────────────────────────────────

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

const baseBudget: BudgetRecord = {
  id: 1,
  workspaceId: 10,
  category: { id: 1, description: "Hogar", isActive: true, isDeletable: false },
  currency: { id: 1, symbol: "ARS" },
  amount: 5000,
  year: null,
  month: null,
  spent: 2300,
  percentage: 46,
};

// ── AddBudgetModal ────────────────────────────────────────────────────────

describe("AddBudgetModal", () => {
  it("muestra el título 'Agregar presupuesto'", async () => {
    const { wrapper } = makeWrapper();
    render(<AddBudgetModal open={true} onClose={vi.fn()} />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Agregar presupuesto")).toBeInTheDocument(),
    );
  });

  it("muestra el switch 'Recurrente' activado por defecto", async () => {
    const { wrapper } = makeWrapper();
    render(<AddBudgetModal open={true} onClose={vi.fn()} />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Recurrente")).toBeInTheDocument(),
    );
    // Switch checked by default — no DatePicker visible
    expect(screen.queryByPlaceholderText("Seleccioná el mes")).not.toBeInTheDocument();
  });

  it("muestra el DatePicker de mes cuando se desactiva el switch Recurrente", async () => {
    const user = userEvent.setup();
    const { wrapper } = makeWrapper();
    render(<AddBudgetModal open={true} onClose={vi.fn()} />, { wrapper });

    await waitFor(() =>
      expect(screen.getByRole("switch")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("switch"));

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("Seleccioná el mes"),
      ).toBeInTheDocument(),
    );
  });

  it("muestra errores de validación al intentar enviar el formulario vacío", async () => {
    const user = userEvent.setup();
    const { wrapper } = makeWrapper();
    render(<AddBudgetModal open={true} onClose={vi.fn()} />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Agregar")).toBeInTheDocument(),
    );

    await user.click(screen.getByText("Agregar"));

    await waitFor(() => {
      // Los mensajes de error conviven con el placeholder del mismo texto,
      // buscamos específicamente dentro del contexto de error de Ant Design
      const errorMessages = document.querySelectorAll(".ant-form-item-explain-error");
      const errorTexts = Array.from(errorMessages).map((el) => el.textContent);
      expect(errorTexts).toContain("Seleccioná un grupo");
      expect(errorTexts).toContain("Seleccioná una moneda");
      expect(errorTexts).toContain("Ingresá un monto");
    });
  });

  it("llama POST /v1/budgets con el payload correcto", async () => {
    const user = userEvent.setup();
    let capturedBody: unknown;

    server.use(
      http.post("http://localhost:8080/budgets", async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { wrapper } = makeWrapper();
    render(<AddBudgetModal open={true} onClose={vi.fn()} />, { wrapper });

    // Wait for options to load
    await waitFor(() =>
      expect(screen.getByText("Agregar presupuesto")).toBeInTheDocument(),
    );

    // Select grupo
    const grupoSelect = screen.getAllByRole("combobox")[0];
    await user.click(grupoSelect);
    const familiaOption = await screen.findByText("Familia");
    await user.click(familiaOption);

    // Select moneda
    const monedaSelect = screen.getAllByRole("combobox")[1];
    await user.click(monedaSelect);
    const arsOption = await screen.findAllByText("ARS");
    await user.click(arsOption[arsOption.length - 1]);

    // Enter monto
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.click(amountInput);
    await user.type(amountInput, "8000");

    // Submit
    await user.click(screen.getByText("Agregar"));

    await waitFor(() => {
      expect(capturedBody).toMatchObject({
        workspaceId: 10,
        currency: "ARS",
        amount: 8000,
        year: null,
        month: null,
      });
    });
  });

  it("llama onClose al hacer click en Cancelar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { wrapper } = makeWrapper();
    render(<AddBudgetModal open={true} onClose={onClose} />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Cancelar")).toBeInTheDocument(),
    );

    await user.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalled();
  });
});

// ── EditBudgetModal ───────────────────────────────────────────────────────

describe("EditBudgetModal", () => {
  it("muestra el título con la categoría del presupuesto", async () => {
    const { wrapper } = makeWrapper();
    render(
      <EditBudgetModal open={true} onClose={vi.fn()} budget={baseBudget} />,
      { wrapper },
    );

    await waitFor(() =>
      expect(
        screen.getByText("Editar presupuesto — Hogar"),
      ).toBeInTheDocument(),
    );
  });

  it("muestra el monto actual como valor inicial del campo", async () => {
    const { wrapper } = makeWrapper();
    render(
      <EditBudgetModal open={true} onClose={vi.fn()} budget={baseBudget} />,
      { wrapper },
    );

    await waitFor(() => {
      const input = screen.getByRole("spinbutton");
      // Ant Design InputNumber devuelve "5000.00" sin separador de miles en el valor interno
      expect(input).toHaveValue("5000.00");
    });
  });

  it("muestra la moneda y categoría del presupuesto como info de solo lectura", async () => {
    const { wrapper } = makeWrapper();
    render(
      <EditBudgetModal open={true} onClose={vi.fn()} budget={baseBudget} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText("ARS")).toBeInTheDocument();
    });
  });

  it("llama PATCH /v1/budgets/{id} con el nuevo monto al guardar", async () => {
    const user = userEvent.setup();
    let capturedBody: unknown;
    let capturedId: string | undefined;

    server.use(
      http.patch(
        "http://localhost:8080/budgets/:id",
        async ({ request, params }) => {
          capturedBody = await request.json();
          capturedId = params.id as string;
          return new HttpResponse(null, { status: 200 });
        },
      ),
    );

    const { wrapper } = makeWrapper();
    render(
      <EditBudgetModal open={true} onClose={vi.fn()} budget={baseBudget} />,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    // Limpiar y escribir nuevo monto
    const amountInput = screen.getByRole("spinbutton");
    await user.clear(amountInput);
    await user.type(amountInput, "7500");

    await user.click(screen.getByText("Guardar"));

    await waitFor(() => {
      expect(capturedId).toBe("1");
      expect(capturedBody).toEqual({ amount: 7500 });
    });
  });

  it("llama onClose al hacer click en Cancelar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { wrapper } = makeWrapper();
    render(
      <EditBudgetModal open={true} onClose={onClose} budget={baseBudget} />,
      { wrapper },
    );

    await waitFor(() =>
      expect(screen.getByText("Cancelar")).toBeInTheDocument(),
    );

    await user.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("muestra 'Sin categoría' cuando el presupuesto no tiene categoría", async () => {
    const noCatBudget: BudgetRecord = {
      ...baseBudget,
      category: null,
    };
    const { wrapper } = makeWrapper();
    render(
      <EditBudgetModal open={true} onClose={vi.fn()} budget={noCatBudget} />,
      { wrapper },
    );

    await waitFor(() =>
      expect(
        screen.getByText("Editar presupuesto — Sin categoría"),
      ).toBeInTheDocument(),
    );
  });
});
