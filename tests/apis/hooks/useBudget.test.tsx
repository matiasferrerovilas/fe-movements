import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { BudgetRecord } from "../../../src/models/Budget";
import {
  useBudgets,
  useAddBudget,
  useUpdateBudget,
  useDeleteBudget,
  BUDGETS_QUERY_KEY,
} from "../../../src/apis/hooks/useBudget";

// ── Mock data ───────────────────────────────────────────────────────────────

const mockBudgets: BudgetRecord[] = [
  {
    id: 1,
    workspaceId: 10,
    category: { id: 8, description: "Supermercado", isActive: true, isDeletable: false },
    currency: { id: 1, symbol: "ARS" },
    amount: 5000,
    year: null,
    month: null,
    spent: 2300,
    percentage: 46,
  },
  {
    id: 2,
    workspaceId: 10,
    category: null,
    currency: { id: 1, symbol: "ARS" },
    amount: 10000,
    year: 2026,
    month: 4,
    spent: 12000,
    percentage: 120,
  },
];

// ── MSW server ──────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/budgets", () =>
    HttpResponse.json(mockBudgets),
  ),
  http.post("http://localhost:8080/budgets", () =>
    new HttpResponse(null, { status: 201 }),
  ),
  http.patch("http://localhost:8080/budgets/:id", () =>
    new HttpResponse(null, { status: 200 }),
  ),
  http.delete("http://localhost:8080/budgets/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

const defaultParams = { currency: "ARS", year: 2026, month: 4 };

// ── useBudgets ──────────────────────────────────────────────────────────────

describe("useBudgets", () => {
  it("calls GET /v1/budgets and returns the budget list", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBudgets(defaultParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(mockBudgets.length);
  });

  it("returns a budget with a full category object", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBudgets(defaultParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const first = result.current.data![0];
    expect(first.id).toBe(1);
    expect(first.category?.description).toBe("Supermercado");
    expect(first.currency.symbol).toBe("ARS");
    expect(first.amount).toBe(5000);
    expect(first.spent).toBe(2300);
    expect(first.percentage).toBe(46);
    expect(first.year).toBeNull();
    expect(first.month).toBeNull();
  });

  it("returns a budget with null category (budget sin categoría)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBudgets(defaultParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const second = result.current.data![1];
    expect(second.category).toBeNull();
    expect(second.year).toBe(2026);
    expect(second.month).toBe(4);
    expect(second.percentage).toBeGreaterThan(100);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/budgets", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBudgets(defaultParams), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("returns an empty array when the server returns an empty list", async () => {
    server.use(
      http.get("http://localhost:8080/budgets", () =>
        HttpResponse.json([]),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBudgets(defaultParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("does not mark data as stale immediately (staleTime: 1 min)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBudgets(defaultParams), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isStale).toBe(false);
  });

  it("uses the correct query key constant", () => {
    expect(BUDGETS_QUERY_KEY).toBe("budgets");
  });

  it("fetches budgets without currency filter (all currencies)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useBudgets({ year: 2026, month: 4 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockBudgets.length);
  });
});

// ── useAddBudget ─────────────────────────────────────────────────────────────

describe("useAddBudget", () => {
  it("calls POST /v1/budgets with the correct payload", async () => {
    let capturedBody: unknown;
    server.use(
      http.post("http://localhost:8080/budgets", async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddBudget(), { wrapper });

    // Ya no se envía workspaceId - el backend usa el workspace activo del usuario
    const payload = {
      category: "Supermercado",
      currency: "ARS",
      amount: 5000,
      year: null,
      month: null,
    };

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedBody).toEqual(payload);
  });

  it("calls POST /v1/budgets with null category (presupuesto sin categoría)", async () => {
    let capturedBody: unknown;
    server.use(
      http.post("http://localhost:8080/budgets", async ({ request }) => {
        capturedBody = await request.json();
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddBudget(), { wrapper });

    // Ya no se envía workspaceId - el backend usa el workspace activo del usuario
    const payload = {
      category: null,
      currency: "USD",
      amount: 2000,
      year: 2026,
      month: 4,
    };

    await act(async () => {
      result.current.mutate(payload);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedBody).toEqual(payload);
  });

  it("invalidates the budgets query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddBudget(), { wrapper });

    await act(async () => {
      result.current.mutate({
        category: "Supermercado",
        currency: "ARS",
        amount: 5000,
        year: null,
        month: null,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["budgets"] });
  });

  it("returns error state when POST /v1/budgets fails", async () => {
    server.use(
      http.post("http://localhost:8080/budgets", () =>
        HttpResponse.json({ message: "Conflict" }, { status: 409 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddBudget(), { wrapper });

    await act(async () => {
      result.current.mutate({
        category: "Supermercado",
        currency: "ARS",
        amount: 5000,
        year: null,
        month: null,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ── useUpdateBudget ──────────────────────────────────────────────────────────

describe("useUpdateBudget", () => {
  it("calls PATCH /v1/budgets/{id} with the correct payload", async () => {
    let capturedBody: unknown;
    let capturedId: string | undefined;
    server.use(
      http.patch(
        "http://localhost:8080/budgets/:id",
        async ({ request, params }) => {
          capturedBody = await request.json();
          capturedId = params.id as string;
          return new HttpResponse(null, { status: 200 });
        },
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useUpdateBudget(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, payload: { amount: 7500 } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedId).toBe("1");
    expect(capturedBody).toEqual({ amount: 7500 });
  });

  it("invalidates the budgets query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateBudget(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, payload: { amount: 7500 } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["budgets"] });
  });

  it("returns error state when PATCH /v1/budgets/{id} fails", async () => {
    server.use(
      http.patch("http://localhost:8080/budgets/:id", () =>
        HttpResponse.json({ message: "Forbidden" }, { status: 403 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useUpdateBudget(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 1, payload: { amount: 7500 } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ── useDeleteBudget ──────────────────────────────────────────────────────────

describe("useDeleteBudget", () => {
  it("calls DELETE /v1/budgets/{id} with the correct id", async () => {
    let capturedId: string | undefined;
    server.use(
      http.delete(
        "http://localhost:8080/budgets/:id",
        ({ params }) => {
          capturedId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteBudget(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedId).toBe("1");
  });

  it("invalidates the budgets query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteBudget(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["budgets"] });
  });

  it("returns error state when DELETE /v1/budgets/{id} returns 403", async () => {
    server.use(
      http.delete("http://localhost:8080/budgets/:id", () =>
        HttpResponse.json({ message: "Forbidden" }, { status: 403 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteBudget(), { wrapper });

    await act(async () => {
      result.current.mutate(99);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
