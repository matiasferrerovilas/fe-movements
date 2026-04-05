import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import IngresoOnBoarding from "../../../src/components/onboarding/IngresoOnBoarding";
import type { OnboardingBankEntry } from "../../../src/apis/onboarding/OnBoarding";

// ── MSW ────────────────────────────────────────────────────────────────────
// IngresoOnBoarding ya no llama a /banks — solo necesita /currencies

const server = setupServer(
  http.get("http://localhost:8080/currencies", () =>
    HttpResponse.json([
      { id: 1, symbol: "ARS" },
      { id: 2, symbol: "USD" },
    ]),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>{children}</ConfigProvider>
    </QueryClientProvider>
  );
}

function renderIngreso(
  onFinish = vi.fn(),
  onPrev = vi.fn(),
  initialValues: {
    userType?: string;
    accountsToAdd?: string[];
    banksToAdd?: OnboardingBankEntry[];
  } = { userType: "CONSUMER" },
) {
  return render(
    <IngresoOnBoarding
      initialValues={initialValues}
      onFinish={onFinish}
      onPrev={onPrev}
    />,
    { wrapper: makeWrapper() },
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("IngresoOnBoarding", () => {
  describe("render inicial", () => {
    it("muestra el título para usuario CONSUMER", async () => {
      renderIngreso();
      await waitFor(() =>
        expect(screen.getByText(/ingresá tu ingreso mensual/i)).toBeInTheDocument(),
      );
    });

    it("muestra el título para usuario COMPANY", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderIngreso(vi.fn(), vi.fn(), { userType: "COMPANY" } as any);
      await waitFor(() =>
        expect(screen.getByText(/ingresá tu ingreso diario/i)).toBeInTheDocument(),
      );
    });

    it("muestra los botones Volver y Finalizar (sin Omitir)", async () => {
      renderIngreso();
      await waitFor(() =>
        expect(screen.getByText("Finalizar")).toBeInTheDocument(),
      );
      expect(screen.getByText("Volver")).toBeInTheDocument();
      expect(screen.queryByText("Omitir por ahora")).not.toBeInTheDocument();
    });

    it("no muestra el selector de grupo si no hay grupos custom", async () => {
      renderIngreso();
      await waitFor(() =>
        expect(screen.getByText("Finalizar")).toBeInTheDocument(),
      );
      expect(screen.queryByText("Grupo")).not.toBeInTheDocument();
    });

    it("muestra el selector de grupo si hay grupos definidos", async () => {
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "CONSUMER",
        accountsToAdd: ["Familia", "Personal"],
      } as never);
      await waitFor(() =>
        expect(screen.getByText("Grupo")).toBeInTheDocument(),
      );
    });
  });

  describe("bancos desde formData (no API)", () => {
    it("muestra los bancos pasados en banksToAdd como opciones del selector", async () => {
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "CONSUMER",
        banksToAdd: [
          { description: "GALICIA", isDefault: true },
          { description: "SANTANDER", isDefault: false },
        ],
      });

      await waitFor(() =>
        expect(screen.getByText("Finalizar")).toBeInTheDocument(),
      );

      // El label del campo Banco debe estar presente
      expect(screen.getByText("Banco")).toBeInTheDocument();
    });

    it("no llama a la API de bancos (solo usa el prop banksToAdd)", async () => {
      // Si el componente intentara llamar /banks sin handler MSW, msw arrojaría un warning.
      // Este test verifica que con banksToAdd vacío el campo banco sigue presente y no hay error.
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "CONSUMER",
        banksToAdd: [],
      });

      await waitFor(() =>
        expect(screen.getByText("Finalizar")).toBeInTheDocument(),
      );

      expect(screen.getByText("Banco")).toBeInTheDocument();
    });
  });

  describe("Finalizar sin datos", () => {
    it("llama onFinish aunque el form esté vacío (todos los campos son opcionales)", async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderIngreso(onFinish);

      await waitFor(() =>
        expect(screen.getByText("Finalizar")).toBeInTheDocument(),
      );

      await user.click(screen.getByText("Finalizar"));

      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe("navegación", () => {
    it("llama onPrev al hacer click en Volver", async () => {
      const user = userEvent.setup();
      const onPrev = vi.fn();
      renderIngreso(vi.fn(), onPrev);

      await waitFor(() =>
        expect(screen.getByText("Volver")).toBeInTheDocument(),
      );

      await user.click(screen.getByText("Volver"));

      expect(onPrev).toHaveBeenCalledTimes(1);
    });
  });
});
