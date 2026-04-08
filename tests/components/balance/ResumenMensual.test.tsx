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
  it("renders three KPI cards after data loads", async () => {
    render(<ResumenMensual filters={baseFilters} />, { wrapper: makeWrapper() });

    // Cards start in loading state — wait for content to appear
    expect(await screen.findByText("Ingresos Totales")).toBeInTheDocument();
    expect(await screen.findByText("Gastos Totales")).toBeInTheDocument();
    expect(await screen.findByText("Balance Total")).toBeInTheDocument();
  });

  it("shows currency in the subtitle", async () => {
    render(<ResumenMensual filters={baseFilters} />, { wrapper: makeWrapper() });

    await waitFor(() => {
      const subtitles = screen.getAllByText(/ARS/);
      expect(subtitles.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("shows a range separator when dates span multiple months", async () => {
    const multiMonthFilters: BalanceFilters = {
      ...baseFilters,
      dates: [dayjs("2026-01-01").toDate(), dayjs("2026-03-31").toDate()],
    };
    render(<ResumenMensual filters={multiMonthFilters} />, {
      wrapper: makeWrapper(),
    });

    // Wait for content and then check that the dash separator is present
    await waitFor(() => {
      const subtitles = screen.getAllByText(/–/);
      expect(subtitles.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays the ingreso integer part after fetch", async () => {
    render(<ResumenMensual filters={baseFilters} />, { wrapper: makeWrapper() });

    // Ant Design Statistic splits int and decimal into separate spans
    // We check for the integer part "5,000"
    await waitFor(() => {
      expect(screen.getByText("5,000")).toBeInTheDocument();
    });
  });
});
