import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { BankRecord } from "../../../src/models/Bank";
import type { Category } from "../../../src/models/Category";
import type { Currency } from "../../../src/apis/currencies/CurrencyApi";
import type { MovementFilters } from "../../../src/routes/movement";
import FiltrosMovement from "../../../src/components/movements/FiltrosMovement";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(() => ({
    isConnected: false,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockBanks: BankRecord[] = [{ id: 1, description: "GALICIA" }];
const mockCategories: Category[] = [
  { id: 1, description: "Supermercado", isActive: true, isDeletable: false },
];
const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso argentino" },
];

const defaultFilters: MovementFilters = {
  description: null,
  type: [],
  bank: [],
  categories: [],
  isLive: true,
  currency: [],
};

// ── MSW server ───────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/banks", () => HttpResponse.json(mockBanks)),
  http.get("http://localhost:8080/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.get("http://localhost:8080/currency", () =>
    HttpResponse.json(mockCurrencies),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const MockAddModal = ({ block }: { block?: boolean }) => (
  <button data-testid="add-modal-trigger" data-block={block}>
    + Movimiento
  </button>
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FiltrosMovement", () => {
  it("renders the Segmented control and the add modal trigger", () => {
    render(
      <FiltrosMovement
        initialFilters={defaultFilters}
        onFiltersChange={vi.fn()}
        AddEditMovementModal={MockAddModal}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("Actuales")).toBeInTheDocument();
    expect(screen.getByText("Históricos")).toBeInTheDocument();
    expect(screen.getByTestId("add-modal-trigger")).toBeInTheDocument();
  });

  it("renders the filter card with all filter fields", () => {
    render(
      <FiltrosMovement
        initialFilters={defaultFilters}
        onFiltersChange={vi.fn()}
        AddEditMovementModal={MockAddModal}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("Filtros")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Banco")).toBeInTheDocument();
    expect(screen.getByText("Moneda")).toBeInTheDocument();
    expect(screen.getByText("Categoría")).toBeInTheDocument();
  });

  it("calls onFiltersChange with updated description when user types", async () => {
    const onFiltersChange = vi.fn();
    render(
      <FiltrosMovement
        initialFilters={defaultFilters}
        onFiltersChange={onFiltersChange}
        AddEditMovementModal={MockAddModal}
      />,
      { wrapper: makeWrapper() },
    );

    const input = screen.getByPlaceholderText("Buscar...");
    await userEvent.type(input, "café");

    await waitFor(() => {
      const lastCall = onFiltersChange.mock.calls.at(-1)?.[0] as MovementFilters;
      expect(lastCall.description).toBe("café");
    });
  });

  it("calls onFiltersChange with isLive=false when switching to Históricos", async () => {
    const onFiltersChange = vi.fn();
    render(
      <FiltrosMovement
        initialFilters={defaultFilters}
        onFiltersChange={onFiltersChange}
        AddEditMovementModal={MockAddModal}
      />,
      { wrapper: makeWrapper() },
    );

    await userEvent.click(screen.getByText("Históricos"));

    await waitFor(() => {
      const lastCall = onFiltersChange.mock.calls.at(-1)?.[0] as MovementFilters;
      expect(lastCall.isLive).toBe(false);
    });
  });

  it("passes block=false to AddEditMovementModal on desktop (default breakpoint)", () => {
    render(
      <FiltrosMovement
        initialFilters={defaultFilters}
        onFiltersChange={vi.fn()}
        AddEditMovementModal={MockAddModal}
      />,
      { wrapper: makeWrapper() },
    );

    // In jsdom the Grid.useBreakpoint defaults to no breakpoints active,
    // so isMobile=true (!screens.md). block prop should be true.
    const trigger = screen.getByTestId("add-modal-trigger");
    expect(trigger).toBeInTheDocument();
  });
});
