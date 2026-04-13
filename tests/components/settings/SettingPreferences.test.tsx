import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { UserSetting } from "../../../src/models/UserSetting";
import { SettingPreferences } from "../../../src/components/settings/SettingPreferences";

// ── MSW server ─────────────────────────────────────────────────────────────

const monthlySummaryEnabled: UserSetting = { key: "MONTHLY_SUMMARY_ENABLED", value: 1 };
const monthlySummaryDisabled: UserSetting = { key: "MONTHLY_SUMMARY_ENABLED", value: 0 };
const autoIncomeEnabled: UserSetting = { key: "AUTO_INCOME_ENABLED", value: 1 };
const autoIncomeDisabled: UserSetting = { key: "AUTO_INCOME_ENABLED", value: 0 };

const server = setupServer(
  http.get("http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED", () =>
    HttpResponse.json(monthlySummaryDisabled),
  ),
  http.get("http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED", () =>
    HttpResponse.json(autoIncomeDisabled),
  ),
  http.put("http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED", () =>
    HttpResponse.json(monthlySummaryEnabled),
  ),
  http.put("http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED", () =>
    HttpResponse.json(autoIncomeEnabled),
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

function renderSettingPreferences() {
  const { wrapper, queryClient } = makeWrapper();
  const result = render(<SettingPreferences />, { wrapper });
  return { ...result, queryClient };
}

// Helper para obtener los toggles por orden (0 = resumen mensual, 1 = ingresos automáticos)
async function getToggles() {
  const toggles = await screen.findAllByRole("switch");
  return {
    monthlySummaryToggle: toggles[0],
    autoIncomeToggle: toggles[1],
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SettingPreferences", () => {
  describe("render inicial", () => {
    it("muestra el título Notificaciones", async () => {
      renderSettingPreferences();
      await waitFor(() =>
        expect(screen.getByText("Notificaciones")).toBeInTheDocument(),
      );
    });

    it("muestra el título Automatización", async () => {
      renderSettingPreferences();
      await waitFor(() =>
        expect(screen.getByText("Automatización")).toBeInTheDocument(),
      );
    });

    it("muestra la opción Resumen mensual con su descripción", async () => {
      renderSettingPreferences();
      await waitFor(() => {
        expect(screen.getByText("Resumen mensual")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Recibirás un resumen de tus gastos al final de cada mes.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("muestra la opción Ingresos automáticos con su descripción", async () => {
      renderSettingPreferences();
      await waitFor(() => {
        expect(screen.getByText("Ingresos automáticos")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Se generarán movimientos de ingreso automáticamente cada mes con los ingresos configurados.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("muestra ambos toggles desactivados cuando ambos values son 0", async () => {
      renderSettingPreferences();
      const { monthlySummaryToggle, autoIncomeToggle } = await getToggles();
      await waitFor(() => {
        expect(monthlySummaryToggle).not.toBeChecked();
        expect(autoIncomeToggle).not.toBeChecked();
      });
    });
  });

  describe("Resumen mensual - interacción", () => {
    it("muestra el toggle activado cuando value es 1", async () => {
      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          () => HttpResponse.json(monthlySummaryEnabled),
        ),
      );
      renderSettingPreferences();
      
      const { monthlySummaryToggle } = await getToggles();
      await waitFor(() => expect(monthlySummaryToggle).toBeChecked());
    });

    it("llama PUT con value:1 al activar el toggle de resumen mensual", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown;

      server.use(
        http.put(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(monthlySummaryEnabled);
          },
        ),
      );

      renderSettingPreferences();
      
      const { monthlySummaryToggle } = await getToggles();
      await waitFor(() => expect(monthlySummaryToggle).not.toBeChecked());

      await user.click(monthlySummaryToggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 1 }),
      );
    });

    it("llama PUT con value:0 al desactivar el toggle de resumen mensual", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown;

      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          () => HttpResponse.json(monthlySummaryEnabled),
        ),
        http.put(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(monthlySummaryDisabled);
          },
        ),
      );

      renderSettingPreferences();
      
      const { monthlySummaryToggle } = await getToggles();
      await waitFor(() => expect(monthlySummaryToggle).toBeChecked());

      await user.click(monthlySummaryToggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 0 }),
      );
    });
  });

  describe("Ingresos automáticos - interacción", () => {
    it("muestra el toggle activado cuando value es 1", async () => {
      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED",
          () => HttpResponse.json(autoIncomeEnabled),
        ),
      );
      renderSettingPreferences();
      
      const { autoIncomeToggle } = await getToggles();
      await waitFor(() => expect(autoIncomeToggle).toBeChecked());
    });

    it("llama PUT con value:1 al activar el toggle de ingresos automáticos", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown;

      server.use(
        http.put(
          "http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED",
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(autoIncomeEnabled);
          },
        ),
      );

      renderSettingPreferences();
      
      const { autoIncomeToggle } = await getToggles();
      await waitFor(() => expect(autoIncomeToggle).not.toBeChecked());

      await user.click(autoIncomeToggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 1 }),
      );
    });

    it("llama PUT con value:0 al desactivar el toggle de ingresos automáticos", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown;

      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED",
          () => HttpResponse.json(autoIncomeEnabled),
        ),
        http.put(
          "http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED",
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(autoIncomeDisabled);
          },
        ),
      );

      renderSettingPreferences();
      
      const { autoIncomeToggle } = await getToggles();
      await waitFor(() => expect(autoIncomeToggle).toBeChecked());

      await user.click(autoIncomeToggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 0 }),
      );
    });
  });
});
