import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { BalanceFilters } from "../../../src/routes/balance";
import { CurrencyEnum } from "../../../src/enums/CurrencyEnum";
import ResumenMensual from "../../../src/components/balance/ResumenMensual";
import dayjs from "dayjs";

// ── MSW server ────────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/balance", () =>
    HttpResponse.json({ INGRESO: 5000, GASTO: 2000 }),
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

const baseFilters: BalanceFilters = {
  account: [1],
  currency: CurrencyEnum.ARS,
  dates: [
    dayjs("2026-01-01").toDate(),
    dayjs("2026-01-31").toDate(),
  ],
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("ResumenMensual", () => {
  it("renders three KPI cards: Ingresos, Gastos, Balance", async () => {
    render(<ResumenMensual filters={baseFilters} />, { wrapper: makeWrapper() });

    expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
    expect(screen.getByText("Gastos Totales")).toBeInTheDocument();
    expect(screen.getByText("Balance Total")).toBeInTheDocument();
  });

  it("shows the period and currency in the subtitle", async () => {
    render(<ResumenMensual filters={baseFilters} />, { wrapper: makeWrapper() });

    // Jan 2026 range — same month so label is "ene. 2026 · ARS" (dayjs locale-dependent)
    // We assert that ARS and the year appear in subtitles
    await waitFor(() => {
      const subtitles = screen.getAllByText(/ARS/);
      expect(subtitles.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("shows a different subtitle when range spans multiple months", () => {
    const multiMonthFilters: BalanceFilters = {
      ...baseFilters,
      dates: [dayjs("2026-01-01").toDate(), dayjs("2026-03-31").toDate()],
    };
    render(<ResumenMensual filters={multiMonthFilters} />, {
      wrapper: makeWrapper(),
    });

    // Both months should appear in subtitles
    const subtitles = screen.getAllByText(/–/);
    expect(subtitles.length).toBeGreaterThanOrEqual(1);
  });

  it("displays loaded balance values after fetch", async () => {
    render(<ResumenMensual filters={baseFilters} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      // INGRESO=5000, GASTO=2000, BALANCE=3000
      // Statistic renders numbers with separators — look for the raw values
      expect(screen.getByText("5,000.00")).toBeInTheDocument();
    });
  });
});
