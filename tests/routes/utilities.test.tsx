import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import React from "react";
import type { Currency } from "@/models/Currency";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/auth/protectedRouteGuard", () => ({
  protectedRouteGuard: () => () => undefined,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: ReactNode }) => opts,
}));

// ── Import después de mocks ────────────────────────────────────────────────

const { Route } = await import("@/routes/utilities");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RouteComponent = (Route as any).component as React.FC;

// ── MSW server ─────────────────────────────────────────────────────────────

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso Argentino", workspaceId: null, isDeletable: false },
];

const server = setupServer(
  http.get("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json({ key: "DEFAULT_CURRENCY", value: 1 }),
  ),
);

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderUtilities() {
  return render(<RouteComponent />, { wrapper: makeWrapper() });
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Utilities route", () => {
  it("renderiza la calculadora de tiempo de recuperación de un gasto", async () => {
    renderUtilities();

    await waitFor(() =>
      expect(
        screen.getByText("Tiempo de recuperación de un gasto"),
      ).toBeInTheDocument(),
    );
  });
});
