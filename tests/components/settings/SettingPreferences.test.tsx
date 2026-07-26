import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { UserSetting } from "@/models/UserSetting";
import { SettingPreferences } from "@/components/settings/SettingPreferences";

// ── MSW server ─────────────────────────────────────────────────────────────

const autoIncomeEnabled: UserSetting = { key: "AUTO_INCOME_ENABLED", value: 1 };
const autoIncomeDisabled: UserSetting = { key: "AUTO_INCOME_ENABLED", value: 0 };

const server = setupServer(
  http.get("http://localhost:8080/settings/defaults/AUTO_INCOME_ENABLED", () =>
    HttpResponse.json(autoIncomeDisabled),
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

async function getAutoIncomeToggle() {
  return screen.findByRole("switch");
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SettingPreferences", () => {
  describe("render inicial", () => {
    it("muestra el título Automatización", async () => {
      renderSettingPreferences();
      await waitFor(() =>
        expect(screen.getByText("Automatización")).toBeInTheDocument(),
      );
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

    it("muestra el toggle desactivado cuando value es 0", async () => {
      renderSettingPreferences();
      const autoIncomeToggle = await getAutoIncomeToggle();
      await waitFor(() => {
        expect(autoIncomeToggle).not.toBeChecked();
      });
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

      const autoIncomeToggle = await getAutoIncomeToggle();
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

      const autoIncomeToggle = await getAutoIncomeToggle();
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

      const autoIncomeToggle = await getAutoIncomeToggle();
      await waitFor(() => expect(autoIncomeToggle).toBeChecked());

      await user.click(autoIncomeToggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 0 }),
      );
    });
  });
});
