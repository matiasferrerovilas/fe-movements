import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { WorkspaceSummary } from "../../../src/models/WorkspaceSummary";
import MonthlySummary from "../../../src/components/home/MonthlySummary";
import dayjs from "dayjs";

import "dayjs/locale/es";
dayjs.locale("es");

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: { authenticated: true },
    initialized: true,
  })),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockSummary: WorkspaceSummary = {
  year: dayjs().year(),
  month: dayjs().month() + 1,
  porMoneda: [
    {
      currency: "ARS",
      totalIngresado: 500000,
      totalGastado: 320000,
      diferencia: 180000,
      categoriaConMayorGasto: "HOGAR",
      comparacionVsMesAnterior: {
        totalIngresadoMesAnterior: 450000,
        totalGastadoMesAnterior: 300000,
        diferenciaIngreso: 50000,
        diferenciaGasto: 20000,
      },
    },
    {
      currency: "USD",
      totalIngresado: 1000,
      totalGastado: 750,
      diferencia: 250,
      categoriaConMayorGasto: "TRANSPORTE",
      comparacionVsMesAnterior: {
        totalIngresadoMesAnterior: 1000,
        totalGastadoMesAnterior: 800,
        diferenciaIngreso: 0,
        diferenciaGasto: -50,
      },
    },
  ],
  totalUnificadoUSD: {
    totalIngresado: 1383.08,
    totalGastado: 995.4,
    diferencia: 387.68,
    comparacionVsMesAnterior: {
      totalIngresadoMesAnterior: 0,
      totalGastadoMesAnterior: 0,
      diferenciaIngreso: 0,
      diferenciaGasto: 0,
    },
  },
};

const mockSummaryOneMoneda: WorkspaceSummary = {
  ...mockSummary,
  porMoneda: [mockSummary.porMoneda[0]],
};

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/workspaces/:workspaceId/summary/monthly", () =>
    HttpResponse.json(mockSummary),
  ),
  // DEFAULT_WORKSPACE must have a valid value for MonthlySummary to fetch
  http.get("http://localhost:8080/settings/defaults/DEFAULT_WORKSPACE", () =>
    HttpResponse.json({ key: "DEFAULT_WORKSPACE", value: 42 }),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json({ key: "DEFAULT_CURRENCY", value: null }),
  ),
  http.get("http://localhost:8080/currency", () =>
    HttpResponse.json([]),
  ),
  http.get("http://localhost:8080/budgets", () =>
    HttpResponse.json([]),
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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MonthlySummary", () => {
  describe("header", () => {
    it("displays the correct month label in the section header", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      const expectedMonth = dayjs().locale("es").format("MMMM YYYY");
      expect(await screen.findByText(expectedMonth, { exact: false })).toBeInTheDocument();
    });
  });

  describe("tabs — multiple currencies", () => {
    it("renders a tab for each currency", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      expect(await screen.findByRole("tab", { name: "ARS" })).toBeInTheDocument();
      expect(await screen.findByRole("tab", { name: "USD" })).toBeInTheDocument();
    });

    it("shows KPI cards for the default (first) currency tab", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      // Wait for tabs to appear (data loaded)
      await screen.findByRole("tab", { name: "ARS" });
      // KPI titles appear in the active tab panel
      expect(screen.getAllByText("Ingresado").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Gastado").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Diferencia").length).toBeGreaterThanOrEqual(1);
    });

    it("shows ARS top category on the first tab", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      expect(await screen.findByText("HOGAR")).toBeInTheDocument();
      expect(await screen.findByText("Mayor gasto del mes:")).toBeInTheDocument();
    });

    it("switches to USD tab and shows USD data", async () => {
      const user = userEvent.setup();
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      const usdTab = await screen.findByRole("tab", { name: "USD" });
      await user.click(usdTab);

      expect(await screen.findByText("TRANSPORTE")).toBeInTheDocument();
    });
  });

  describe("single currency — no tabs", () => {
    it("does not render tabs when only one currency", async () => {
      server.use(
        http.get("http://localhost:8080/workspaces/:workspaceId/summary/monthly", () =>
          HttpResponse.json(mockSummaryOneMoneda),
        ),
      );

      render(<MonthlySummary />, { wrapper: makeWrapper() });

      // Wait for data to load — the category strip is unique when single currency
      await screen.findByText("HOGAR");
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });

    it("shows KPI cards directly without tabs", async () => {
      server.use(
        http.get("http://localhost:8080/workspaces/:workspaceId/summary/monthly", () =>
          HttpResponse.json(mockSummaryOneMoneda),
        ),
      );

      render(<MonthlySummary />, { wrapper: makeWrapper() });

      await screen.findByText("HOGAR");
      expect(screen.getAllByText("Ingresado").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Gastado").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Diferencia").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("category strip", () => {
    it("shows top spending category", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      expect(await screen.findByText("HOGAR")).toBeInTheDocument();
      expect(await screen.findByText("Mayor gasto del mes:")).toBeInTheDocument();
    });

    it("does not show category strip when categoriaConMayorGasto is null", async () => {
      const noCategory: WorkspaceSummary = {
        ...mockSummaryOneMoneda,
        porMoneda: [{ ...mockSummaryOneMoneda.porMoneda[0], categoriaConMayorGasto: null }],
      };
      server.use(
        http.get("http://localhost:8080/workspaces/:workspaceId/summary/monthly", () =>
          HttpResponse.json(noCategory),
        ),
      );

      render(<MonthlySummary />, { wrapper: makeWrapper() });

      // Wait for data — use the Total USD section as anchor (always present)
      await screen.findByText(/total en usd/i);
      expect(screen.queryByText("Mayor gasto del mes:")).not.toBeInTheDocument();
    });
  });

  describe("total en USD", () => {
    it("renders the Total en USD section", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      expect(await screen.findByText(/total en usd/i)).toBeInTheDocument();
    });

    it("displays the ingresado USD value", async () => {
      render(<MonthlySummary />, { wrapper: makeWrapper() });

      // 1383.08 formatted as es-AR
      await waitFor(() => {
        expect(screen.getByText("$1.383,08")).toBeInTheDocument();
      });
    });
  });

  describe("empty state", () => {
    it("shows empty message when porMoneda is empty", async () => {
      server.use(
        http.get("http://localhost:8080/workspaces/:workspaceId/summary/monthly", () =>
          HttpResponse.json({ ...mockSummary, porMoneda: [] }),
        ),
      );

      render(<MonthlySummary />, { wrapper: makeWrapper() });

      expect(
        await screen.findByText("Sin movimientos registrados este mes."),
      ).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows an error message when the request fails", async () => {
      server.use(
        http.get("http://localhost:8080/workspaces/:workspaceId/summary/monthly", () =>
          HttpResponse.json({ message: "Error" }, { status: 500 }),
        ),
      );

      render(<MonthlySummary />, { wrapper: makeWrapper() });

      expect(
        await screen.findByText("No se pudo cargar el resumen mensual."),
      ).toBeInTheDocument();
    });
  });

  describe("no default workspace", () => {
    it("does not fetch summary when DEFAULT_WORKSPACE is null", async () => {
      server.use(
        http.get("http://localhost:8080/settings/defaults/DEFAULT_WORKSPACE", () =>
          HttpResponse.json({ key: "DEFAULT_WORKSPACE", value: null }),
        ),
      );

      render(<MonthlySummary />, { wrapper: makeWrapper() });

      // The header should render, but no KPI cards (empty state)
      const expectedMonth = dayjs().locale("es").format("MMMM YYYY");
      expect(await screen.findByText(expectedMonth, { exact: false })).toBeInTheDocument();
      
      // Since workspaceId is null, query is disabled → shows loading skeleton
      // Check that no error message is shown (query didn't fail, it's just disabled)
      expect(screen.queryByText("No se pudo cargar el resumen mensual.")).not.toBeInTheDocument();
    });
  });
});
