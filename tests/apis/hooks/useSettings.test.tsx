import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import {
  useUserDefaults,
  useUserDefault,
  useSetUserDefault,
} from "../../../src/apis/hooks/useSettings";

// ── MSW server ──────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/settings/defaults", () =>
    HttpResponse.json([
      { key: "DEFAULT_CURRENCY", value: 1 },
      { key: "DEFAULT_WORKSPACE", value: 10 },
    ]),
  ),
  http.get("http://localhost:8080/settings/defaults/:key", ({ params }) => {
    const key = params.key as string;
    if (key === "DEFAULT_WORKSPACE") {
      return HttpResponse.json({ key: "DEFAULT_WORKSPACE", value: 10 });
    }
    if (key === "DEFAULT_CURRENCY") {
      return HttpResponse.json({ key: "DEFAULT_CURRENCY", value: 1 });
    }
    return HttpResponse.json(null, { status: 404 });
  }),
  http.put("http://localhost:8080/settings/defaults/:key", () =>
    new HttpResponse(null, { status: 200 }),
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

// ── useUserDefaults ─────────────────────────────────────────────────────────

describe("useUserDefaults", () => {
  it("fetches all user defaults", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useUserDefaults(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});

// ── useUserDefault ──────────────────────────────────────────────────────────

describe("useUserDefault", () => {
  it("fetches a specific user default by key", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useUserDefault("DEFAULT_WORKSPACE"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ key: "DEFAULT_WORKSPACE", value: 10 });
  });
});

// ── useSetUserDefault ───────────────────────────────────────────────────────

describe("useSetUserDefault", () => {
  it("invalidates user-defaults queries on success", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_CURRENCY", value: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["user-defaults"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["user-defaults", "DEFAULT_CURRENCY"],
    });
  });

  it("invalidates workspace-dependent queries when changing DEFAULT_WORKSPACE", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_WORKSPACE", value: 20 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Debe invalidar las queries dependientes del workspace
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["categories"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["budgets"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["workspace-members"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["movement-history"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["service-history"] });
  });

  it("does NOT invalidate workspace-dependent queries when changing other settings", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_CURRENCY", value: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // NO debe invalidar las queries dependientes del workspace cuando cambia otra setting
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["categories"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["budgets"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["workspace-members"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["movement-history"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["service-history"] });
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.put("http://localhost:8080/settings/defaults/:key", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_WORKSPACE", value: 20 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
