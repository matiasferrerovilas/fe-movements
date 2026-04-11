import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { BudgetRecord } from "../../../src/models/Budget";
import BudgetAlert from "../../../src/components/home/BudgetAlert";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: { authenticated: true },
    initialized: true,
  })),
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ACCOUNT_ID = 10;
const CURRENCY_ID = 1;
const CURRENCY_SYMBOL = "ARS";

const mockBudgets: BudgetRecord[] = [
  {
    id: 1,
    workspaceId: ACCOUNT_ID,
    category: { id: 8, description: "Supermercado", isActive: true, isDeletable: false },
    currency: { id: CURRENCY_ID, symbol: CURRENCY_SYMBOL },
    amount: 5000,
    year: null,
    month: null,
    spent: 3000,
    percentage: 60, // ≥ 50 → alerta
  },
  {
    id: 2,
    workspaceId: ACCOUNT_ID,
    category: { id: 9, description: "Transporte", isActive: true, isDeletable: false },
    currency: { id: CURRENCY_ID, symbol: CURRENCY_SYMBOL },
    amount: 10000,
    year: null,
    month: null,
    spent: 11000,
    percentage: 110, // ≥ 50 → alerta (excedido)
  },
  {
    id: 3,
    workspaceId: ACCOUNT_ID,
    category: { id: 10, description: "Ocio", isActive: true, isDeletable: false },
    currency: { id: CURRENCY_ID, symbol: CURRENCY_SYMBOL },
    amount: 2000,
    year: null,
    month: null,
    spent: 800,
    percentage: 40, // < 50 → no alerta
  },
];

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/settings/defaults/DEFAULT_WORKSPACE", () =>
    HttpResponse.json({ key: "DEFAULT_WORKSPACE", value: ACCOUNT_ID }),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json({ key: "DEFAULT_CURRENCY", value: CURRENCY_ID }),
  ),
  http.get("http://localhost:8080/currency", () =>
    HttpResponse.json([{ id: CURRENCY_ID, symbol: CURRENCY_SYMBOL, description: "Peso argentino", code: "ARS" }]),
  ),
  http.get("http://localhost:8080/budgets", () =>
    HttpResponse.json(mockBudgets),
  ),
  http.delete("http://localhost:8080/budgets/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
  http.patch("http://localhost:8080/budgets/:id", () =>
    new HttpResponse(null, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderAlert() {
  return render(<BudgetAlert />, { wrapper: makeWrapper() });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BudgetAlert", () => {
  describe("no renderiza nada cuando faltan defaults", () => {
    it("retorna null cuando DEFAULT_WORKSPACE no tiene valor", async () => {
      server.use(
        http.get("http://localhost:8080/settings/defaults/DEFAULT_WORKSPACE", () =>
          HttpResponse.json({ key: "DEFAULT_WORKSPACE", value: null }),
        ),
      );

      const { container } = renderAlert();

      // Wait for all queries to settle (no pending state)
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it("retorna null cuando DEFAULT_CURRENCY no tiene valor", async () => {
      server.use(
        http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
          HttpResponse.json({ key: "DEFAULT_CURRENCY", value: null }),
        ),
      );

      const { container } = renderAlert();

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe("no renderiza nada cuando todos los presupuestos están bajo el 50%", () => {
    it("retorna null cuando ningún presupuesto supera el umbral", async () => {
      const allBelowThreshold: BudgetRecord[] = mockBudgets.map((b) => ({
        ...b,
        percentage: 40,
      }));
      server.use(
        http.get("http://localhost:8080/budgets", () =>
          HttpResponse.json(allBelowThreshold),
        ),
      );

      const { container } = renderAlert();

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it("retorna null cuando la lista de presupuestos está vacía", async () => {
      server.use(
        http.get("http://localhost:8080/budgets", () =>
          HttpResponse.json([]),
        ),
      );

      const { container } = renderAlert();

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe("renderiza presupuestos en alerta", () => {
    it("muestra el título 'Presupuestos en alerta'", async () => {
      renderAlert();

      expect(
        await screen.findByText("Presupuestos en alerta"),
      ).toBeInTheDocument();
    });

    it("muestra el badge con el conteo de presupuestos en alerta", async () => {
      renderAlert();

      // 2 budgets ≥ 50% (ids 1 y 2), 1 below (id 3)
      await screen.findByText("Presupuestos en alerta");
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renderiza las cards de presupuestos con percentage >= 50", async () => {
      renderAlert();

      await screen.findByText("Supermercado");
      expect(screen.getByText("Supermercado")).toBeInTheDocument();
      expect(screen.getByText("Transporte")).toBeInTheDocument();
    });

    it("no renderiza la card del presupuesto por debajo del 50%", async () => {
      renderAlert();

      await screen.findByText("Supermercado");
      expect(screen.queryByText("Ocio")).not.toBeInTheDocument();
    });
  });

  describe("botón 'Ver todos'", () => {
    it("muestra el botón 'Ver todos'", async () => {
      renderAlert();

      expect(await screen.findByText("Ver todos")).toBeInTheDocument();
    });

    it("navega a /budgets al hacer click en 'Ver todos'", async () => {
      const user = userEvent.setup();
      renderAlert();

      const btn = await screen.findByText("Ver todos");
      await user.click(btn);

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/budgets" });
    });
  });

  describe("eliminar presupuesto", () => {
    it("llama a DELETE /v1/budgets/:id al confirmar eliminación", async () => {
      let capturedId: string | undefined;
      server.use(
        http.delete("http://localhost:8080/budgets/:id", ({ params }) => {
          capturedId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const user = userEvent.setup();
      renderAlert();

      // Click the delete button on the first alert budget (Supermercado)
      const deleteBtn = await screen.findByRole("button", {
        name: "Eliminar presupuesto Supermercado",
      });
      await user.click(deleteBtn);

      // Confirm in the popconfirm
      const confirmBtn = await screen.findByRole("button", { name: "Eliminar" });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(capturedId).toBe("1");
      });
    });
  });

  describe("editar presupuesto", () => {
    it("abre el modal de edición al hacer click en el botón Editar", async () => {
      const user = userEvent.setup();
      renderAlert();

      const editBtn = await screen.findByRole("button", {
        name: "Editar presupuesto Supermercado",
      });
      await user.click(editBtn);

      // EditBudgetModal title contains the category name
      expect(
        await screen.findByText(/editar presupuesto.*supermercado/i),
      ).toBeInTheDocument();
    });
  });
});
