import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Currency } from "@/models/Currency";
import {
  useCurrency,
  useAddCurrency,
  useDeleteCurrency,
} from "@/apis/hooks/useCurrency";
import { CURRENCY_QUERY_KEY } from "@/apis/hooks/currencyQueryKeys";

// ── MSW server ─────────────────────────────────────────────────────────────

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "$", description: "Peso Argentino", workspaceId: null, isDeletable: false },
  { id: 2, symbol: "US$", description: "Dólar estadounidense", workspaceId: null, isDeletable: false },
];

const newCurrency: Currency = {
  id: 3,
  symbol: "€",
  description: "Euro",
  workspaceId: 10,
  isDeletable: true,
};

const server = setupServer(
  http.get("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.post("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(newCurrency, { status: 201 }),
  ),
  http.delete("http://localhost:8080/workspace/currencies/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── useCurrency ────────────────────────────────────────────────────────────

describe("useCurrency", () => {
  it("calls GET /currency and returns the currency list", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCurrency(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCurrencies);
  });

  it("uses the correct query key", async () => {
    expect(CURRENCY_QUERY_KEY).toEqual(["currencies"]);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/currencies", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCurrency(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("returns an empty array when the server returns an empty list", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCurrency(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

// ── useAddCurrency ─────────────────────────────────────────────────────────

describe("useAddCurrency", () => {
  it("calls POST /workspace/currencies with the payload and returns the created currency", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddCurrency(), { wrapper });

    await act(async () => {
      result.current.mutate({ symbol: "€", description: "Euro" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newCurrency);
  });

  it("invalidates the currencies query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddCurrency(), { wrapper });

    await act(async () => {
      result.current.mutate({ symbol: "€", description: "Euro" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: CURRENCY_QUERY_KEY });
  });

  it("returns error state when POST /workspace/currencies fails", async () => {
    server.use(
      http.post("http://localhost:8080/workspace/currencies", () =>
        HttpResponse.json({ message: "Bad Request" }, { status: 400 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddCurrency(), { wrapper });

    await act(async () => {
      result.current.mutate({ symbol: "€", description: "Euro" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ── useDeleteCurrency ──────────────────────────────────────────────────────

describe("useDeleteCurrency", () => {
  it("calls DELETE /workspace/currencies/{id} and resolves successfully", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteCurrency(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("invalidates currencies query and DEFAULT_CURRENCY user-default on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCurrency(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: CURRENCY_QUERY_KEY });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["user-defaults", "DEFAULT_CURRENCY"],
    });
  });

  it("returns error state when DELETE /workspace/currencies/{id} returns 404", async () => {
    server.use(
      http.delete("http://localhost:8080/workspace/currencies/:id", () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteCurrency(), { wrapper });

    await act(async () => {
      result.current.mutate(99);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
