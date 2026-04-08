import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { MonthlyEvolutionRecord } from "../../../src/models/Balance";
import EvolucionAnual from "../../../src/components/balance/EvolucionAnual";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(() => ({
    isConnected: false,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
}));

// ── MSW server ────────────────────────────────────────────────────────────────

const mockEvolution: MonthlyEvolutionRecord[] = [
  { month: 1, currencySymbol: "ARS", total: 1000 },
  { month: 2, currencySymbol: "ARS", total: 1500 },
  { month: 3, currencySymbol: "ARS", total: 800 },
];

const server = setupServer(
  http.get("http://localhost:8080/balance/monthly-evolution", () =>
    HttpResponse.json(mockEvolution),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
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

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("EvolucionAnual", () => {
  it("renders the card title", () => {
    render(<EvolucionAnual year={2026} />, { wrapper: makeWrapper() });

    expect(screen.getByText("Evolución Anual de Gastos")).toBeInTheDocument();
  });

  it("shows empty state when there is no data", async () => {
    server.use(
      http.get("http://localhost:8080/balance/monthly-evolution", () =>
        HttpResponse.json([]),
      ),
    );

    render(<EvolucionAnual year={2026} />, { wrapper: makeWrapper() });

    // Wait for the fetch to settle and empty state to appear
    const emptyMsg = await screen.findByText("Sin datos para el año seleccionado");
    expect(emptyMsg).toBeInTheDocument();
  });
});
