import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";
import { setupServer } from "msw/node";
import { useState, type ReactNode } from "react";
import { App as AntdApp } from "antd";
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

// Reemplaza el hook de borrado deshacible por una versión síncrona (sin
// esperar los 7s reales) que sigue siendo reactiva (isPending refleja el
// estado inmediatamente tras requestDelete/requestDeleteMany), y expone spies
// para verificar con qué argumentos se la invoca.
const requestDeleteSpy = vi.fn();
const requestDeleteManySpy = vi.fn();

vi.mock("@/utils/useUndoableDelete", () => ({
  useUndoableDelete: () => {
    const [pending, setPending] = useState<Set<number>>(new Set());
    const requestDelete = (id: number) => {
      requestDeleteSpy(id);
      setPending((prev) => new Set(prev).add(id));
    };
    const requestDeleteMany = (ids: number[]) => {
      requestDeleteManySpy(ids);
      setPending((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    };
    return {
      requestDelete,
      requestDeleteMany,
      isPending: (id: number) => pending.has(id),
    };
  },
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
    <QueryClientProvider client={queryClient}>
      <AntdApp>{children}</AntdApp>
    </QueryClientProvider>
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

  describe("borrado en lote", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost:8080/expenses", () => HttpResponse.json(filledPageResponse)),
      );
    });

    it("no elimina de inmediato: pide confirmación y usa requestDeleteMany en vez de llamar al DELETE directamente", async () => {
      const user = userEvent.setup();
      render(<MovementTable filters={defaultFilters} />, { wrapper: makeWrapper() });

      await waitFor(() =>
        expect(screen.getAllByText(/Movimiento 1/).length).toBeGreaterThan(0),
      );

      const [checkbox1] = screen.getAllByRole("checkbox", {
        name: "Seleccionar movimiento",
      });
      await user.click(checkbox1);

      await user.click(screen.getByRole("button", { name: "Eliminar" }));

      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).getAllByText(/¿Eliminar 1 movimientos?/).length).toBeGreaterThan(0);

      expect(requestDeleteManySpy).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

      await waitFor(() => expect(requestDeleteManySpy).toHaveBeenCalledWith([1]));
    });

    it("atenúa (dimming) las filas seleccionadas apenas se confirma el borrado en lote", async () => {
      const user = userEvent.setup();
      const { container } = render(<MovementTable filters={defaultFilters} />, {
        wrapper: makeWrapper(),
      });

      await waitFor(() =>
        expect(screen.getAllByText(/Movimiento 1/).length).toBeGreaterThan(0),
      );

      const [checkbox1] = screen.getAllByRole("checkbox", {
        name: "Seleccionar movimiento",
      });
      await user.click(checkbox1);
      await user.click(screen.getByRole("button", { name: "Eliminar" }));

      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

      await waitFor(() => expect(requestDeleteManySpy).toHaveBeenCalled());
      expect(container.querySelector('[style*="opacity: 0.45"]')).toBeInTheDocument();
    });
  });
});
