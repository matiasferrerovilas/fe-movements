import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Currency } from "@/models/Currency";
import type { UserSetting } from "@/models/UserSetting";
import { SettingCurrency } from "@/components/settings/SettingCurrency";

// ── Mock useCurrentUser ────────────────────────────────────────────────────
vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

// ── MSW server ─────────────────────────────────────────────────────────────
// id 1: moneda global del catálogo (workspaceId null) → nunca se puede eliminar.
// id 2: moneda propia del workspace, y es la default → bloqueada solo por ser default.
// id 3: moneda propia del workspace, no default → se puede eliminar libremente.

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "$", description: "Peso Argentino", workspaceId: null, isDeletable: false },
  { id: 2, symbol: "US$", description: "Dólar estadounidense", workspaceId: 10, isDeletable: true },
  { id: 3, symbol: "€", description: "Euro", workspaceId: 10, isDeletable: true },
];

const defaultCurrencySetting: UserSetting = { key: "DEFAULT_CURRENCY", value: 2 };
const newCurrency: Currency = {
  id: 4,
  symbol: "R$",
  description: "Real Brasileño",
  workspaceId: 10,
  isDeletable: true,
};

const server = setupServer(
  http.get("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json(defaultCurrencySetting),
  ),
  http.post("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(newCurrency, { status: 201 }),
  ),
  http.delete("http://localhost:8080/workspace/currencies/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
  http.put("http://localhost:8080/settings/defaults/:key", () =>
    HttpResponse.json({ key: "DEFAULT_CURRENCY", value: 3 }),
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

function renderSettingCurrency() {
  const { wrapper, queryClient } = makeWrapper();
  const result = render(<SettingCurrency />, { wrapper });
  return { ...result, queryClient };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SettingCurrency", () => {
  describe("render inicial", () => {
    it("muestra el título Mis Monedas", async () => {
      renderSettingCurrency();
      await waitFor(() => expect(screen.getByText("Mis Monedas")).toBeInTheDocument());
    });

    it("muestra las monedas visibles para el workspace activo", async () => {
      renderSettingCurrency();
      await waitFor(() => {
        expect(screen.getByText("Peso Argentino")).toBeInTheDocument();
        expect(screen.getByText("Dólar estadounidense")).toBeInTheDocument();
        expect(screen.getByText("Euro")).toBeInTheDocument();
      });
    });

    it("muestra el badge Default en la moneda por defecto", async () => {
      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByText("★ Default")).toBeInTheDocument(),
      );
    });

    it("muestra el formulario para agregar moneda", async () => {
      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByPlaceholderText("Símbolo...")).toBeInTheDocument(),
      );
      expect(screen.getByPlaceholderText("Nombre de la moneda...")).toBeInTheDocument();
      expect(screen.getByText("Agregar")).toBeInTheDocument();
    });

    it("muestra el mensaje cuando no hay monedas", async () => {
      server.use(
        http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])),
      );
      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByPlaceholderText("Símbolo...")).toBeInTheDocument(),
      );
      expect(screen.queryByText("Peso Argentino")).not.toBeInTheDocument();
    });
  });

  describe("formulario de creación", () => {
    it("llama POST /workspace/currencies con el símbolo y descripción ingresados al hacer submit", async () => {
      const user = userEvent.setup();
      let postedBody: unknown;
      server.use(
        http.post("http://localhost:8080/workspace/currencies", async ({ request }) => {
          postedBody = await request.json();
          return HttpResponse.json(newCurrency, { status: 201 });
        }),
      );

      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByPlaceholderText("Símbolo...")).toBeInTheDocument(),
      );

      await user.type(screen.getByPlaceholderText("Símbolo..."), "R$");
      await user.type(
        screen.getByPlaceholderText("Nombre de la moneda..."),
        "Real Brasileño",
      );
      await user.click(screen.getByText("Agregar"));

      await waitFor(() =>
        expect(postedBody).toEqual({ symbol: "R$", description: "Real Brasileño" }),
      );
    });

    it("muestra error de validación si se envía el form vacío", async () => {
      const user = userEvent.setup();
      renderSettingCurrency();

      await waitFor(() =>
        expect(screen.getByText("Agregar")).toBeInTheDocument(),
      );

      await user.click(screen.getByText("Agregar"));

      await waitFor(() =>
        expect(screen.getByText("Ingresá el símbolo")).toBeInTheDocument(),
      );
      expect(
        screen.getByText("Ingresá el nombre de la moneda"),
      ).toBeInTheDocument();
    });

    it("limpia el formulario tras agregar con éxito", async () => {
      const user = userEvent.setup();
      renderSettingCurrency();

      await waitFor(() =>
        expect(screen.getByPlaceholderText("Símbolo...")).toBeInTheDocument(),
      );

      await user.type(screen.getByPlaceholderText("Símbolo..."), "R$");
      await user.type(
        screen.getByPlaceholderText("Nombre de la moneda..."),
        "Real Brasileño",
      );
      await user.click(screen.getByText("Agregar"));

      await waitFor(() =>
        expect(screen.getByPlaceholderText("Símbolo...")).toHaveValue(""),
      );
      expect(screen.getByPlaceholderText("Nombre de la moneda...")).toHaveValue("");
    });
  });

  describe("botón de delete", () => {
    it("está deshabilitado para una moneda global del catálogo (workspaceId null)", async () => {
      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByText("Peso Argentino")).toBeInTheDocument(),
      );

      const deleteGlobalBtn = screen.getByRole("button", {
        name: /Eliminar moneda Peso Argentino/i,
      });
      expect(deleteGlobalBtn).toBeDisabled();
    });

    it("está deshabilitado para la moneda por defecto del workspace, aunque sea eliminable", async () => {
      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByText("Dólar estadounidense")).toBeInTheDocument(),
      );

      const deleteDefaultBtn = screen.getByRole("button", {
        name: /Eliminar moneda Dólar estadounidense/i,
      });
      expect(deleteDefaultBtn).toBeDisabled();
    });

    it("permite eliminar libremente una moneda propia del workspace que no es la default", async () => {
      const user = userEvent.setup();
      let deletedId: string | undefined;
      server.use(
        http.delete("http://localhost:8080/workspace/currencies/:id", ({ params }) => {
          deletedId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      renderSettingCurrency();
      await waitFor(() => expect(screen.getByText("Euro")).toBeInTheDocument());

      const deleteEuroBtn = screen.getByRole("button", {
        name: /Eliminar moneda Euro/i,
      });
      expect(deleteEuroBtn).not.toBeDisabled();
      await user.click(deleteEuroBtn);

      const confirmBtn = await screen.findByText("Eliminar");
      await user.click(confirmBtn);

      await waitFor(() => expect(deletedId).toBe("3"));
    });
  });

  describe("establecer moneda por defecto", () => {
    it("deshabilita el botón de estrella para la moneda que ya es default", async () => {
      renderSettingCurrency();
      await waitFor(() =>
        expect(screen.getByText("Dólar estadounidense")).toBeInTheDocument(),
      );

      const starDefaultBtn = screen.getByRole("button", {
        name: /Estrella moneda Dólar estadounidense/i,
      });
      const starOtherBtn = screen.getByRole("button", {
        name: /Estrella moneda Euro/i,
      });
      expect(starDefaultBtn).toBeDisabled();
      expect(starOtherBtn).not.toBeDisabled();
    });
  });
});
