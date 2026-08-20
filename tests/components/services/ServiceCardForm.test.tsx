import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Currency } from "@/apis/currency/CurrencyApi";
import type { UserSetting } from "@/models/UserSetting";
import { ServiceCardForm } from "@/components/services/ServiceCardForm";

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso argentino", workspaceId: null, isDeletable: false },
];

const defaultCurrencySetting: UserSetting = { key: "DEFAULT_CURRENCY", value: 1 };

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json(defaultCurrencySetting),
  ),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
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

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ServiceCardForm", () => {
  it("renders the form fields when currencies exist", async () => {
    render(<ServiceCardForm handleAddService={vi.fn()} />, { wrapper: makeWrapper() });

    expect(await screen.findByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agregar servicio/i })).toBeInTheDocument();
  });
});

describe("ServiceCardForm sin monedas cargadas", () => {
  it("muestra el aviso de moneda requerida en vez del formulario", async () => {
    server.use(http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])));
    render(<ServiceCardForm handleAddService={vi.fn()} />, { wrapper: makeWrapper() });

    expect(
      await screen.findByText("Necesitás una moneda para continuar"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Descripción")).not.toBeInTheDocument();
  });

  it("navega a /settings con el tab de finanzas al hacer click en 'Ir a Configuración'", async () => {
    server.use(http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])));
    const user = userEvent.setup();
    render(<ServiceCardForm handleAddService={vi.fn()} />, { wrapper: makeWrapper() });

    const ctaBtn = await screen.findByRole("button", { name: /ir a configuración/i });
    await user.click(ctaBtn);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/settings",
      search: { tab: "finanzas" },
    });
  });
});
