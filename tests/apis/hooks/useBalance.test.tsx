import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { RecoveryTimeRecord } from "@/models/RecoveryTime";
import { useRecoveryTime } from "@/apis/hooks/useBalance";

// ── MSW server ─────────────────────────────────────────────────────────────

const mockRecoverable: RecoveryTimeRecord = {
  monto: 2000,
  moneda: "ARS",
  mesesConsiderados: 3,
  ahorroPromedioMensual: 666.67,
  mesesParaRecuperar: 3,
  recuperable: true,
};

const server = setupServer(
  http.get("http://localhost:8080/balance/recovery-time", ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      ...mockRecoverable,
      monto: Number(url.searchParams.get("amount")),
      moneda: url.searchParams.get("currency"),
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ── useRecoveryTime ────────────────────────────────────────────────────────

describe("useRecoveryTime", () => {
  it("no dispara la request cuando params es null", () => {
    const wrapper = makeWrapper();
    const { result } = renderHook(() => useRecoveryTime(null), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("llama GET /balance/recovery-time con amount, currency y months cuando params no es null", async () => {
    let requestedUrl: URL | undefined;
    server.use(
      http.get("http://localhost:8080/balance/recovery-time", ({ request }) => {
        requestedUrl = new URL(request.url);
        return HttpResponse.json(mockRecoverable);
      }),
    );

    const wrapper = makeWrapper();
    const { result } = renderHook(
      () => useRecoveryTime({ amount: 2000, currency: "ARS", months: 3 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requestedUrl?.searchParams.get("amount")).toBe("2000");
    expect(requestedUrl?.searchParams.get("currency")).toBe("ARS");
    expect(requestedUrl?.searchParams.get("months")).toBe("3");
    expect(result.current.data).toEqual(mockRecoverable);
  });

  it("devuelve recuperable: false y mesesParaRecuperar: null cuando el ahorro promedio no es positivo", async () => {
    const nonRecoverable: RecoveryTimeRecord = {
      monto: 2000,
      moneda: "ARS",
      mesesConsiderados: 3,
      ahorroPromedioMensual: -150.5,
      mesesParaRecuperar: null,
      recuperable: false,
    };
    server.use(
      http.get("http://localhost:8080/balance/recovery-time", () =>
        HttpResponse.json(nonRecoverable),
      ),
    );

    const wrapper = makeWrapper();
    const { result } = renderHook(
      () => useRecoveryTime({ amount: 2000, currency: "ARS" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(nonRecoverable);
  });

  it("returns error state when the request fails", async () => {
    server.use(
      http.get("http://localhost:8080/balance/recovery-time", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const wrapper = makeWrapper();
    const { result } = renderHook(
      () => useRecoveryTime({ amount: 2000, currency: "ARS" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
