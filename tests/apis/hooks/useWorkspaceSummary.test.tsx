import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { WorkspaceSummary } from "@/models/WorkspaceSummary";
import {
  useWorkspaceSummary,
  WORKSPACE_SUMMARY_QUERY_KEY,
} from "@/apis/hooks/useWorkspaceSummary";

const mockSummary: WorkspaceSummary = {
  year: 2026,
  month: 4,
  perCurrency: [
    {
      currency: "ARS",
      totalIncome: 500000,
      totalSpent: 320000,
      net: 180000,
      topSpendingCategory: "HOGAR",
      vsPreviousMonth: {
        previousMonthIncome: 450000,
        previousMonthSpent: 300000,
        incomeDelta: 50000,
        spentDelta: 20000,
      },
    },
    {
      currency: "USD",
      totalIncome: 1000,
      totalSpent: 750,
      net: 250,
      topSpendingCategory: "TRANSPORTE",
      vsPreviousMonth: {
        previousMonthIncome: 1000,
        previousMonthSpent: 800,
        incomeDelta: 0,
        spentDelta: -50,
      },
    },
  ],
  totalUsd: {
    totalIncome: 1383.08,
    totalSpent: 995.4,
    net: 387.68,
    vsPreviousMonth: {
      previousMonthIncome: 0,
      previousMonthSpent: 0,
      incomeDelta: 0,
      spentDelta: 0,
    },
  },
};

const server = setupServer(
  http.get(
    "http://localhost:8080/workspaces/:workspaceId/summary/monthly",
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
  it("calls GET /workspaces/:workspaceId/summary/monthly with year and month params", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(42, 2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSummary);
  });

  it("returns the full summary shape including perCurrency and totalUsd", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(42, 2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const data = result.current.data!;
    expect(data.perCurrency).toHaveLength(2);
    expect(data.perCurrency[0].currency).toBe("ARS");
    expect(data.perCurrency[0].totalIncome).toBe(500000);
    expect(data.perCurrency[0].totalSpent).toBe(320000);
    expect(data.perCurrency[0].net).toBe(180000);
    expect(data.perCurrency[0].topSpendingCategory).toBe("HOGAR");
    expect(data.perCurrency[0].vsPreviousMonth.incomeDelta).toBe(50000);
    expect(data.perCurrency[0].vsPreviousMonth.spentDelta).toBe(20000);
    expect(data.totalUsd.totalIncome).toBe(1383.08);
    expect(data.totalUsd.totalSpent).toBe(995.4);
    expect(data.totalUsd.net).toBe(387.68);
  });

  it("uses the correct query key", () => {
    expect(WORKSPACE_SUMMARY_QUERY_KEY).toBe("workspace-monthly-summary");
  });

  it("does not mark data as stale immediately (staleTime: 1min)", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(42, 2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get(
        "http://localhost:8080/workspaces/:workspaceId/summary/monthly",
        () => HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useWorkspaceSummary(42, 2026, 4), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when workspaceId is null", async () => {
    const { result } = renderHook(() => useWorkspaceSummary(null, 2026, 4), {
      wrapper: makeWrapper(),
    });

    // The query should stay in pending state without fetching
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
