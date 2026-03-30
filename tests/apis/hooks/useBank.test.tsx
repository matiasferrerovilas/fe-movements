import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { BankRecord } from "../../../src/models/Bank";
import {
  useBanks,
  useAddBank,
  useDeleteBank,
  BANKS_QUERY_KEY,
} from "../../../src/apis/hooks/useBank";

// ── MSW server ─────────────────────────────────────────────────────────────

const mockBanks: BankRecord[] = [
  { id: 1, description: "GALICIA" },
  { id: 2, description: "SANTANDER" },
];

const newBank: BankRecord = { id: 3, description: "NACION" };

const server = setupServer(
  http.get("http://localhost:8080/banks", () => HttpResponse.json(mockBanks)),
  http.post("http://localhost:8080/banks", () =>
    HttpResponse.json(newBank, { status: 201 }),
  ),
  http.delete("http://localhost:8080/banks/:id", () =>
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

// ── useBanks ───────────────────────────────────────────────────────────────

describe("useBanks", () => {
  it("calls GET /banks and returns the bank list", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBanks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockBanks);
  });

  it("uses the correct query key", async () => {
    expect(BANKS_QUERY_KEY).toEqual(["banks"]);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/banks", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBanks(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("returns an empty array when the server returns an empty list", async () => {
    server.use(
      http.get("http://localhost:8080/banks", () => HttpResponse.json([])),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useBanks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

// ── useAddBank ─────────────────────────────────────────────────────────────

describe("useAddBank", () => {
  it("calls POST /banks with the description and returns the created bank", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddBank(), { wrapper });

    await act(async () => {
      result.current.mutate("nacion");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newBank);
  });

  it("invalidates the banks query on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddBank(), { wrapper });

    await act(async () => {
      result.current.mutate("nacion");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: BANKS_QUERY_KEY });
  });

  it("returns error state when POST /banks fails", async () => {
    server.use(
      http.post("http://localhost:8080/banks", () =>
        HttpResponse.json({ message: "Bad Request" }, { status: 400 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useAddBank(), { wrapper });

    await act(async () => {
      result.current.mutate("nacion");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

// ── useDeleteBank ──────────────────────────────────────────────────────────

describe("useDeleteBank", () => {
  it("calls DELETE /banks/{id} and resolves successfully", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteBank(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("invalidates banks query and DEFAULT_BANK user-default on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteBank(), { wrapper });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: BANKS_QUERY_KEY });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["user-defaults", "DEFAULT_BANK"],
    });
  });

  it("returns error state when DELETE /banks/{id} returns 404", async () => {
    server.use(
      http.delete("http://localhost:8080/banks/:id", () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteBank(), { wrapper });

    await act(async () => {
      result.current.mutate(99);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
