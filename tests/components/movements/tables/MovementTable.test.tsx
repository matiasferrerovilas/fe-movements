import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Movement } from "@/models/Movement";
import type { PageResponse } from "@/models/BaseMode";
import type { MovementFilters } from "@/routes/movements";
import { TypeEnum } from "@/enums/TypeEnum";
import MovementTable from "@/components/movements/tables/MovementTable";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(() => ({
    isConnected: false,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
}));

vi.mock("@/apis/hooks/useWorkspaces", () => ({
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
    createdAt: "2026-01-15T10:00:00",
    updatedAt: "2026-01-15T10:00:00",
    bank: "GALICIA",
    categories: [],
    currency: { id: 1, symbol: "ARS", description: "Peso argentino" },
    type: TypeEnum.DEBITO,
    cuotasTotales: null,
    cuotaActual: null,
    metadata: {
      owner: { id: 1, givenName: "Test" },
      workspace: { id: 10, name: "Familia" },
      exchangeRate: 1,
      amountUsd: null,
    },
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

    it("shows the first-movement CTA instead of the list when there are no movements and no active filters", async () => {
      render(<MovementTable filters={defaultFilters} />, { wrapper: makeWrapper() });

      await waitFor(() =>
        expect(screen.getByText("¿Empezamos?")).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: /Cargar mi primer movimiento/ }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Sin movimientos")).not.toBeInTheDocument();
    });

    it("shows 'Sin movimientos' (not the CTA) when a filter is active and returns no results", async () => {
      render(
        <MovementTable filters={{ ...defaultFilters, description: "no existe" }} />,
        { wrapper: makeWrapper() },
      );

      await waitFor(() =>
        expect(screen.getAllByText("Sin movimientos").length).toBeGreaterThan(0),
      );
      expect(screen.queryByText("¿Empezamos?")).not.toBeInTheDocument();
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

  describe("estado de carga", () => {
    it("muestra un spinner en vez del CTA o la tabla mientras carga", async () => {
      server.use(
        http.get("http://localhost:8080/expenses", async () => {
          await delay(50);
          return HttpResponse.json(filledPageResponse);
        }),
      );

      const { container } = render(<MovementTable filters={defaultFilters} />, {
        wrapper: makeWrapper(),
      });

      expect(container.querySelector(".ant-spin")).toBeInTheDocument();
      expect(screen.queryByText("¿Empezamos?")).not.toBeInTheDocument();
      expect(screen.queryByText(/Movimiento 1/)).not.toBeInTheDocument();

      await waitFor(() =>
        expect(screen.getAllByText(/Movimiento 1/).length).toBeGreaterThan(0),
      );
      expect(container.querySelector(".ant-spin")).not.toBeInTheDocument();
    });

    it("notifica onStateChange con hasMovements=true cuando hay movimientos", async () => {
      server.use(
        http.get("http://localhost:8080/expenses", () => HttpResponse.json(filledPageResponse)),
      );
      const onStateChange = vi.fn();

      render(<MovementTable filters={defaultFilters} onStateChange={onStateChange} />, {
        wrapper: makeWrapper(),
      });

      expect(onStateChange).toHaveBeenCalledWith({ isLoading: true, hasMovements: false });

      await waitFor(() =>
        expect(onStateChange).toHaveBeenCalledWith({ isLoading: false, hasMovements: true }),
      );
    });

    it("notifica onStateChange con hasMovements=false cuando la cuenta no tiene movimientos", async () => {
      server.use(
        http.get("http://localhost:8080/expenses", () => HttpResponse.json(emptyPageResponse)),
      );
      const onStateChange = vi.fn();

      render(<MovementTable filters={defaultFilters} onStateChange={onStateChange} />, {
        wrapper: makeWrapper(),
      });

      await waitFor(() =>
        expect(onStateChange).toHaveBeenCalledWith({ isLoading: false, hasMovements: false }),
      );
    });
  });
});
