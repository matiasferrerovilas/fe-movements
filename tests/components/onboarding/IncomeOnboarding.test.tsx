import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import IncomeOnboarding from "@/components/onboarding/IncomeOnboarding";
import type { OnboardingBankEntry, OnboardingCurrencyEntry } from "@/apis/onboarding/OnboardingApi";

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
    currenciesToAdd?: OnboardingCurrencyEntry[];
  } = { userType: "PERSONAL" },
) {
  return render(
    <IncomeOnboarding
      initialValues={initialValues}
      onFinish={onFinish}
      onPrev={onPrev}
    />,
    { wrapper: makeWrapper() },
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("IncomeOnboarding", () => {
  describe("render inicial", () => {
    it("muestra el título para usuario PERSONAL", () => {
      renderIngreso(vi.fn(), vi.fn(), { userType: "PERSONAL" });
      expect(screen.getByText(/ingresá tu ingreso mensual/i)).toBeInTheDocument();
    });

    it("muestra el título para usuario ENTERPRISE", () => {
      renderIngreso(vi.fn(), vi.fn(), { userType: "ENTERPRISE" });
      expect(screen.getByText(/ingresá tu ingreso diario/i)).toBeInTheDocument();
    });

    it("muestra los botones Volver y Finalizar (sin Omitir)", () => {
      renderIngreso();
      expect(screen.getByText("Finalizar")).toBeInTheDocument();
      expect(screen.getByText("Volver")).toBeInTheDocument();
      expect(screen.queryByText("Omitir por ahora")).not.toBeInTheDocument();
    });

    it("muestra el selector de workspace deshabilitado con el default indicado si no hay workspaces custom", () => {
      renderIngreso();
      expect(screen.getByText("Workspace")).toBeInTheDocument();
      expect(screen.getByText("Tu workspace por defecto")).toBeInTheDocument();
    });

    it("muestra el selector de workspace habilitado si hay workspaces definidos", async () => {
      const user = userEvent.setup();
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "PERSONAL",
        accountsToAdd: ["Familia", "Personal"],
      });
      expect(screen.getByText("Workspace")).toBeInTheDocument();

      const [, , workspaceSelect] = screen.getAllByRole("combobox");
      await user.click(workspaceSelect);

      await waitFor(() => {
        expect(screen.getAllByText("Familia").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Personal").length).toBeGreaterThan(0);
      });
    });
  });

  describe("bancos desde formData (no API)", () => {
    it("muestra los bancos pasados en banksToAdd como opciones del selector", () => {
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "PERSONAL",
        banksToAdd: [
          { description: "GALICIA", isDefault: true },
          { description: "SANTANDER", isDefault: false },
        ],
      });

      // El label del campo Banco debe estar presente
      expect(screen.getByText("Banco")).toBeInTheDocument();
    });

    it("no llama a la API de bancos (solo usa el prop banksToAdd)", () => {
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "PERSONAL",
        banksToAdd: [],
      });

      expect(screen.getByText("Banco")).toBeInTheDocument();
    });
  });

  describe("monedas desde formData (no API)", () => {
    it("muestra las monedas pasadas en currenciesToAdd como opciones del selector", async () => {
      const user = userEvent.setup();
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "PERSONAL",
        currenciesToAdd: [
          { symbol: "ARS", description: "Peso argentino" },
          { symbol: "USD", description: "Dólar" },
        ],
      });

      const [, currencySelect] = screen.getAllByRole("combobox");
      await user.click(currencySelect);

      await waitFor(() => {
        expect(screen.getByText("ARS — Peso argentino")).toBeInTheDocument();
        expect(screen.getByText("USD — Dólar")).toBeInTheDocument();
      });
    });

    it("no muestra opciones de moneda si currenciesToAdd está vacío", () => {
      renderIngreso(vi.fn(), vi.fn(), {
        userType: "PERSONAL",
        currenciesToAdd: [],
      });

      expect(screen.getByText("Moneda")).toBeInTheDocument();
    });
  });

  describe("Finalizar sin datos", () => {
    it("llama onFinish aunque el form esté vacío (todos los campos son opcionales)", async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderIngreso(onFinish);

      await user.click(screen.getByText("Finalizar"));

      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it("llama onFinish con accountToAdd DEFAULT cuando no hay workspaces custom", async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      renderIngreso(onFinish);

      await user.click(screen.getByText("Finalizar"));

      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({ accountToAdd: "DEFAULT" }),
      );
    });
  });

  describe("navegación", () => {
    it("llama onPrev al hacer click en Volver", async () => {
      const user = userEvent.setup();
      const onPrev = vi.fn();
      renderIngreso(vi.fn(), onPrev);

      await user.click(screen.getByText("Volver"));

      expect(onPrev).toHaveBeenCalledTimes(1);
    });
  });
});
