import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Currency } from "@/models/Currency";
import type { UserSetting } from "@/models/UserSetting";
import type { RecoveryTimeRecord } from "@/models/RecoveryTime";
import { RecoveryTimeCalculator } from "@/components/utilities/RecoveryTimeCalculator";

// ── MSW server ─────────────────────────────────────────────────────────────

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso Argentino", workspaceId: null, isDeletable: false },
  { id: 2, symbol: "USD", description: "Dólar", workspaceId: null, isDeletable: false },
];

const defaultCurrencySetting: UserSetting = { key: "DEFAULT_CURRENCY", value: 1 };

const recoverableResult: RecoveryTimeRecord = {
  monto: 2000,
  moneda: "ARS",
  mesesConsiderados: 3,
  ahorroPromedioMensual: 666.67,
  mesesParaRecuperar: 3,
  recuperable: true,
};

const nonRecoverableResult: RecoveryTimeRecord = {
  monto: 2000,
  moneda: "ARS",
  mesesConsiderados: 3,
  ahorroPromedioMensual: -150.5,
  mesesParaRecuperar: null,
  recuperable: false,
};

const server = setupServer(
  http.get("http://localhost:8080/workspace/currencies", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json(defaultCurrencySetting),
  ),
  http.get("http://localhost:8080/balance/recovery-time", () =>
    HttpResponse.json(recoverableResult),
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
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderCalculator() {
  return render(<RecoveryTimeCalculator />, { wrapper: makeWrapper() });
}

async function fillAmountAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() =>
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument(),
  );
  await user.type(screen.getByPlaceholderText("0.00"), "2000");
  await user.click(screen.getByRole("button", { name: /Calcular/i }));
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("RecoveryTimeCalculator", () => {
  describe("render inicial", () => {
    it("muestra el título", () => {
      renderCalculator();
      expect(
        screen.getByText("Tiempo de recuperación de un gasto"),
      ).toBeInTheDocument();
    });

    it("muestra los campos del formulario", async () => {
      renderCalculator();
      await waitFor(() =>
        expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument(),
      );
      expect(screen.getByText("Monto del gasto")).toBeInTheDocument();
      expect(screen.getByText("Moneda", { selector: "label" })).toBeInTheDocument();
      expect(screen.getByText("Meses a promediar")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Calcular/i })).toBeInTheDocument();
    });

    it("precarga la moneda por defecto del usuario una vez que carga", async () => {
      renderCalculator();
      await waitFor(
        () => expect(screen.getByText("ARS")).toBeInTheDocument(),
        { timeout: 3000 },
      );
    });

    it("precarga 3 meses a promediar por defecto", async () => {
      renderCalculator();
      await waitFor(() => {
        const monthsInput = document.querySelector<HTMLInputElement>(
          'input[role="spinbutton"]:not(#amount)',
        );
        expect(monthsInput?.value).toBe("3");
      });
    });

    it("no muestra resultados antes de calcular", async () => {
      renderCalculator();
      await waitFor(() =>
        expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument(),
      );
      expect(screen.queryByText(/Ahorro promedio mensual/)).not.toBeInTheDocument();
    });
  });

  describe("validación", () => {
    it("muestra error si se calcula sin ingresar el monto", async () => {
      const user = userEvent.setup();
      renderCalculator();

      await waitFor(() =>
        expect(screen.getByRole("button", { name: /Calcular/i })).toBeInTheDocument(),
      );
      await user.click(screen.getByRole("button", { name: /Calcular/i }));

      await waitFor(() =>
        expect(screen.getByText("Ingresá el monto")).toBeInTheDocument(),
      );
    });
  });

  describe("cálculo — caso recuperable", () => {
    it("llama GET /balance/recovery-time con amount, currency y months", async () => {
      let requestedUrl: URL | undefined;
      server.use(
        http.get("http://localhost:8080/balance/recovery-time", ({ request }) => {
          requestedUrl = new URL(request.url);
          return HttpResponse.json(recoverableResult);
        }),
      );

      const user = userEvent.setup();
      renderCalculator();
      await fillAmountAndSubmit(user);

      await waitFor(() => expect(requestedUrl).toBeDefined());
      expect(requestedUrl?.searchParams.get("amount")).toBe("2000");
      expect(requestedUrl?.searchParams.get("currency")).toBe("ARS");
      expect(requestedUrl?.searchParams.get("months")).toBe("3");
    });

    it("muestra el ahorro promedio mensual y los meses estimados de recuperación", async () => {
      const user = userEvent.setup();
      renderCalculator();
      await fillAmountAndSubmit(user);

      await waitFor(() =>
        expect(screen.getByText(/Ahorro promedio mensual/)).toBeInTheDocument(),
      );
      expect(screen.getByText("Tiempo estimado de recuperación")).toBeInTheDocument();
      const statisticValues = Array.from(
        document.querySelectorAll(".ant-statistic-content-value"),
      ).map((el) => el.textContent);
      expect(statisticValues).toContain("3.0");
    });
  });

  describe("cálculo — caso no recuperable", () => {
    it("muestra la alerta de 'No recuperable a este ritmo' cuando recuperable es false", async () => {
      server.use(
        http.get("http://localhost:8080/balance/recovery-time", () =>
          HttpResponse.json(nonRecoverableResult),
        ),
      );

      const user = userEvent.setup();
      renderCalculator();
      await fillAmountAndSubmit(user);

      await waitFor(() =>
        expect(screen.getByText("No recuperable a este ritmo")).toBeInTheDocument(),
      );
      expect(
        screen.queryByText("Tiempo estimado de recuperación"),
      ).not.toBeInTheDocument();
    });
  });

  describe("manejo de errores", () => {
    it("muestra una alerta cuando la request falla", async () => {
      server.use(
        http.get("http://localhost:8080/balance/recovery-time", () =>
          HttpResponse.json({ message: "Server Error" }, { status: 500 }),
        ),
      );

      const user = userEvent.setup();
      renderCalculator();
      await fillAmountAndSubmit(user);

      await waitFor(() =>
        expect(
          screen.getByText(
            "No pudimos calcular el tiempo de recuperación. Probá de nuevo.",
          ),
        ).toBeInTheDocument(),
      );
    });
  });
});
