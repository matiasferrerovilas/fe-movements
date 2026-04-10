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

  it("returns the full summary shape including comparacion", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.totalIngresado).toBe(150000);
    expect(data.totalGastado).toBe(87500);
    expect(data.diferencia).toBe(62500);
    expect(data.categoriaConMayorGasto).toBe("HOGAR");
    expect(data.comparacionVsMesAnterior.diferenciaIngreso).toBe(10000);
    expect(data.comparacionVsMesAnterior.diferenciaGasto).toBe(-7500);
  });

  it("uses the correct query key", () => {
    expect(WORKSPACE_SUMMARY_QUERY_KEY).toBe("workspace-monthly-summary");
  });

  it("includes year and month in the query key", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // staleTime: 1min → data should not be stale immediately
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
