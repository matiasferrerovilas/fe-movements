import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Movement } from "../../../../src/models/Movement";
import type { PageResponse } from "../../../../src/models/BaseMode";
import type { MovementFilters } from "../../../../src/routes/movement";
import { TypeEnum } from "../../../../src/enums/TypeExpense";
import MovementTable from "../../../../src/components/movements/tables/MovementTable";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(() => ({
    isConnected: false,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
}));

vi.mock("../../../../src/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(() => ({ data: [], isSuccess: true })),
}));

// ── Fixtures ────────────────────────────────────────────────────────────────

const defaultFilters: MovementFilters = {
  description: null,
  type: [],
  bank: [],
  categories: [],
  isLive: true,
  currency: [],
};

function makeMovement(id: number): Movement {
  return {
    id,
    amount: 500,
    description: `Movimiento ${id}`,
    date: "2026-01-15",
    owner: { id: 1, email: "test@test.com" },
    bank: "GALICIA",
    category: null,
    currency: { id: 1, symbol: "ARS", code: "ARS", name: "Peso argentino" },
    type: TypeEnum.DEBITO,
    cuotasTotales: null,
    cuotaActual: null,
    account: { id: 10, name: "Familia" },
  };
}

function makePageResponse(movements: Movement[]): PageResponse<Movement> {
  return {
    content: movements,
    totalElements: movements.length,
    totalPages: movements.length === 0 ? 0 : 1,
    size: 25,
    number: 0,
    first: true,
    last: true,
  };
}

// ── MSW server ─────────────────────────────────────────────────────────────

const emptyPageResponse = makePageResponse([]);
const filledPageResponse = makePageResponse([makeMovement(1), makeMovement(2)]);

const server = setupServer(
  http.get("http://localhost:8080/expenses", () =>
    HttpResponse.json(emptyPageResponse),
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
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("MovementTable", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("empty state", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost:8080/expenses", () =>
          HttpResponse.json(emptyPageResponse),
        ),
      );
    });

    it("shows 'Sin movimientos' when the API returns an empty list", async () => {
      render(<MovementTable filters={defaultFilters} />, { wrapper: makeWrapper() });

      await waitFor(() =>
        expect(screen.getAllByText("Sin movimientos").length).toBeGreaterThan(0),
      );
    });
  });

  describe("with movements", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost:8080/expenses", () =>
          HttpResponse.json(filledPageResponse),
        ),
      );
    });

    it("renders movement rows when the API returns data", async () => {
      render(<MovementTable filters={defaultFilters} />, { wrapper: makeWrapper() });

      await waitFor(() =>
        expect(screen.getAllByText(/Movimiento 1/).length).toBeGreaterThan(0),
      );
      expect(screen.queryByText("Sin movimientos")).not.toBeInTheDocument();
    });

    it("renders the correct number of movement entries", async () => {
      render(<MovementTable filters={defaultFilters} />, { wrapper: makeWrapper() });

      await waitFor(() =>
        expect(screen.getAllByText(/Movimiento \d/).length).toBeGreaterThanOrEqual(2),
      );
    });
  });
});
