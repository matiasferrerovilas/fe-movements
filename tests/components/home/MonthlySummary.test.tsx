import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { WorkspaceSummary } from "../../../src/models/WorkspaceSummary";
import MonthlySummary from "../../../src/components/home/MonthlySummary";
import dayjs from "dayjs";

// dayjs locale needed by the component
import "dayjs/locale/es";
dayjs.locale("es");

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: { authenticated: true },
    initialized: true,
  })),
}));

// ── MSW server ────────────────────────────────────────────────────────────────

const mockSummary: WorkspaceSummary = {
  year: dayjs().year(),
  month: dayjs().month() + 1,
  totalIngresado: 150000,
  totalGastado: 87500,
  diferencia: 62500,
  categoriaConMayorGasto: "HOGAR",
  comparacionVsMesAnterior: {
    totalIngresadoMesAnterior: 140000,
    totalGastadoMesAnterior: 95000,
    diferenciaGasto: -7500,
    diferenciaIngreso: 10000,
  },
};

const server = setupServer(
  http.get("http://localhost:8080/v1/workspaces/0/summary/monthly", () =>
    HttpResponse.json(mockSummary),
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

describe("MonthlySummary", () => {
  it("renders three KPI card titles after data loads", async () => {
    render(<MonthlySummary />, { wrapper: makeWrapper() });

    expect(await screen.findByText("Ingresado")).toBeInTheDocument();
    expect(await screen.findByText("Gastado")).toBeInTheDocument();
    expect(await screen.findByText("Diferencia")).toBeInTheDocument();
  });

  it("displays the correct month label in the section header", async () => {
    render(<MonthlySummary />, { wrapper: makeWrapper() });

    const expectedMonth = dayjs().locale("es").format("MMMM YYYY");
    expect(await screen.findByText(expectedMonth, { exact: false })).toBeInTheDocument();
  });

  it("shows the top spending category", async () => {
    render(<MonthlySummary />, { wrapper: makeWrapper() });

    expect(await screen.findByText("HOGAR")).toBeInTheDocument();
    expect(await screen.findByText("Mayor gasto del mes:")).toBeInTheDocument();
  });

  it("displays the ingresado integer part", async () => {
    render(<MonthlySummary />, { wrapper: makeWrapper() });

    // Ant Design Statistic splits integer and decimal in separate spans
    await waitFor(() => {
      expect(screen.getByText("150,000")).toBeInTheDocument();
    });
  });

  it("shows an error message when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/v1/workspaces/0/summary/monthly", () =>
        HttpResponse.json({ message: "Error" }, { status: 500 }),
      ),
    );

    render(<MonthlySummary />, { wrapper: makeWrapper() });

    expect(
      await screen.findByText("No se pudo cargar el resumen mensual."),
    ).toBeInTheDocument();
  });

  it("does not show category strip when categoriaConMayorGasto is null", async () => {
    server.use(
      http.get("http://localhost:8080/v1/workspaces/0/summary/monthly", () =>
        HttpResponse.json({ ...mockSummary, categoriaConMayorGasto: null }),
      ),
    );

    render(<MonthlySummary />, { wrapper: makeWrapper() });

    // Wait for data to load
    await screen.findByText("Ingresado");

    expect(screen.queryByText("Mayor gasto del mes:")).not.toBeInTheDocument();
  });
});
