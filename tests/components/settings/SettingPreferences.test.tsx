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

const enabledSetting: UserSetting = { key: "MONTHLY_SUMMARY_ENABLED", value: 1 };
const disabledSetting: UserSetting = { key: "MONTHLY_SUMMARY_ENABLED", value: 0 };

const server = setupServer(
  http.get("http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED", () =>
    HttpResponse.json(disabledSetting),
  ),
  http.put("http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED", () =>
    HttpResponse.json(enabledSetting),
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

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SettingPreferences", () => {
  describe("render inicial", () => {
    it("muestra el título Notificaciones", async () => {
      renderSettingPreferences();
      await waitFor(() =>
        expect(screen.getByText("Notificaciones")).toBeInTheDocument(),
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

    it("muestra el toggle desactivado cuando value es 0", async () => {
      renderSettingPreferences();
      const toggle = await screen.findByRole("switch");
      await waitFor(() => expect(toggle).not.toBeChecked());
    });

    it("muestra el toggle activado cuando value es 1", async () => {
      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          () => HttpResponse.json(enabledSetting),
        ),
      );
      renderSettingPreferences();
      const toggle = await screen.findByRole("switch");
      await waitFor(() => expect(toggle).toBeChecked());
    });

    it("muestra el toggle desactivado cuando el key no existe (404)", async () => {
      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          () => new HttpResponse(null, { status: 404 }),
        ),
      );
      renderSettingPreferences();
      const toggle = await screen.findByRole("switch");
      await waitFor(() => expect(toggle).not.toBeChecked());
    });
  });

  describe("interacción con el toggle", () => {
    it("llama PUT con value:1 al activar el toggle", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown;

      server.use(
        http.put(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(enabledSetting);
          },
        ),
      );

      renderSettingPreferences();
      const toggle = await screen.findByRole("switch");
      await waitFor(() => expect(toggle).not.toBeChecked());

      await user.click(toggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 1 }),
      );
    });

    it("llama PUT con value:0 al desactivar el toggle", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown;

      server.use(
        http.get(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          () => HttpResponse.json(enabledSetting),
        ),
        http.put(
          "http://localhost:8080/settings/defaults/MONTHLY_SUMMARY_ENABLED",
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(disabledSetting);
          },
        ),
      );

      renderSettingPreferences();
      const toggle = await screen.findByRole("switch");
      await waitFor(() => expect(toggle).toBeChecked());

      await user.click(toggle);

      await waitFor(() =>
        expect(capturedBody).toEqual({ value: 0 }),
      );
    });
  });
});
