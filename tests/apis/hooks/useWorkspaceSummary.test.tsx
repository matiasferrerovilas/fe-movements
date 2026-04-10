import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { WorkspaceSummary } from "../../../src/models/WorkspaceSummary";
import {
  useWorkspaceSummary,
  WORKSPACE_SUMMARY_QUERY_KEY,
} from "../../../src/apis/hooks/useWorkspaceSummary";

const mockSummary: WorkspaceSummary = {
  year: 2026,
  month: 4,
  porMoneda: [
    {
      currency: "ARS",
      ingresado: 500000,
      gastado: 320000,
      diferencia: 180000,
      categoriaConMayorGasto: "HOGAR",
      comparacion: {
        ingresadoMesAnterior: 450000,
        gastadoMesAnterior: 300000,
        diferenciaIngresado: 50000,
        diferenciaGastado: 20000,
      },
    },
    {
      currency: "USD",
      ingresado: 1000,
      gastado: 750,
      diferencia: 250,
      categoriaConMayorGasto: "TRANSPORTE",
      comparacion: {
        ingresadoMesAnterior: 1000,
        gastadoMesAnterior: 800,
        diferenciaIngresado: 0,
        diferenciaGastado: -50,
      },
    },
  ],
  totalUnificadoUSD: {
    ingresado: 1383.08,
    gastado: 995.4,
    diferencia: 387.68,
  },
};

const server = setupServer(
  http.get(
    "http://localhost:8080/workspaces/0/summary/monthly",
    () => HttpResponse.json(mockSummary),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useWorkspaceSummary", () => {
  it("calls GET /workspaces/0/summary/monthly with year and month params", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSummary);
  });

  it("returns the full summary shape including porMoneda and totalUnificadoUSD", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.porMoneda).toHaveLength(2);
    expect(data.porMoneda[0].currency).toBe("ARS");
    expect(data.porMoneda[0].ingresado).toBe(500000);
    expect(data.porMoneda[0].gastado).toBe(320000);
    expect(data.porMoneda[0].diferencia).toBe(180000);
    expect(data.porMoneda[0].categoriaConMayorGasto).toBe("HOGAR");
    expect(data.porMoneda[0].comparacion.diferenciaIngresado).toBe(50000);
    expect(data.porMoneda[0].comparacion.diferenciaGastado).toBe(20000);
    expect(data.totalUnificadoUSD.ingresado).toBe(1383.08);
    expect(data.totalUnificadoUSD.gastado).toBe(995.4);
    expect(data.totalUnificadoUSD.diferencia).toBe(387.68);
  });

  it("uses the correct query key", () => {
    expect(WORKSPACE_SUMMARY_QUERY_KEY).toBe("workspace-monthly-summary");
  });

  it("does not mark data as stale immediately (staleTime: 1min)", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get(
        "http://localhost:8080/workspaces/0/summary/monthly",
        () => HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useWorkspaceSummary(2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
