import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import CurrencyOnboarding from "@/components/onboarding/CurrencyOnboarding";
import type { OnboardingCurrencyEntry } from "@/apis/onboarding/OnboardingApi";

function wrapper({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}

function renderMoneda(
  onNext = vi.fn(),
  onPrev = vi.fn(),
  initialValues: { userType?: string; currenciesToAdd?: OnboardingCurrencyEntry[] } = {},
) {
  return render(
    <CurrencyOnboarding
      initialValues={initialValues}
      onNext={onNext}
      onPrev={onPrev}
    />,
    { wrapper },
  );
}

describe("CurrencyOnboarding", () => {
  describe("render inicial", () => {
    it("muestra los inputs de símbolo y nombre de moneda", () => {
      renderMoneda();
      expect(screen.getByPlaceholderText("Ej: USD, ARS...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ej: Dólar, Peso argentino...")).toBeInTheDocument();
    });

    it("muestra los botones Volver y Siguiente", () => {
      renderMoneda();
      expect(screen.getByText("Volver")).toBeInTheDocument();
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
    });

    it("muestra estado vacío cuando no hay monedas", () => {
      renderMoneda();
      expect(screen.getByText(/no agregaste monedas aún/i)).toBeInTheDocument();
    });

    it("muestra las monedas pre-cargadas desde initialValues", () => {
      renderMoneda(vi.fn(), vi.fn(), {
        currenciesToAdd: [{ symbol: "ARS", description: "Peso argentino" }],
      });
      expect(screen.getByText("ARS")).toBeInTheDocument();
      expect(screen.getByText("Peso argentino")).toBeInTheDocument();
    });
  });

  describe("agregar monedas", () => {
    it("agrega una moneda al hacer click en Agregar", async () => {
      const user = userEvent.setup();
      renderMoneda();

      await user.type(screen.getByPlaceholderText("Ej: USD, ARS..."), "usd");
      await user.type(
        screen.getByPlaceholderText("Ej: Dólar, Peso argentino..."),
        "Dólar",
      );
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() => expect(screen.getByText("USD")).toBeInTheDocument());
      expect(screen.getByText("Dólar")).toBeInTheDocument();
    });

    it("limpia los inputs después de agregar", async () => {
      const user = userEvent.setup();
      renderMoneda();

      await user.type(screen.getByPlaceholderText("Ej: USD, ARS..."), "usd");
      await user.type(
        screen.getByPlaceholderText("Ej: Dólar, Peso argentino..."),
        "Dólar",
      );
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(screen.getByPlaceholderText("Ej: USD, ARS...")).toHaveValue(""),
      );
    });

    it("no agrega una moneda con símbolo duplicado", async () => {
      const user = userEvent.setup();
      renderMoneda(vi.fn(), vi.fn(), {
        currenciesToAdd: [{ symbol: "USD", description: "Dólar" }],
      });

      await user.type(screen.getByPlaceholderText("Ej: USD, ARS..."), "usd");
      await user.type(
        screen.getByPlaceholderText("Ej: Dólar, Peso argentino..."),
        "Dólar americano",
      );
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() => {
        expect(screen.getAllByText("USD")).toHaveLength(1);
      });
    });
  });

  describe("validación", () => {
    it("muestra error si el símbolo está vacío al intentar agregar", async () => {
      const user = userEvent.setup();
      renderMoneda();

      await user.type(
        screen.getByPlaceholderText("Ej: Dólar, Peso argentino..."),
        "Dólar",
      );
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(
          screen.getByText(/ingresá el símbolo de la moneda/i),
        ).toBeInTheDocument(),
      );
    });

    it("muestra error si el nombre está vacío al intentar agregar", async () => {
      const user = userEvent.setup();
      renderMoneda();

      await user.type(screen.getByPlaceholderText("Ej: USD, ARS..."), "USD");
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(
          screen.getByText(/ingresá el nombre de la moneda/i),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("eliminar monedas", () => {
    it("elimina una moneda al hacer click en su botón eliminar", async () => {
      const user = userEvent.setup();
      renderMoneda(vi.fn(), vi.fn(), {
        currenciesToAdd: [
          { symbol: "USD", description: "Dólar" },
          { symbol: "ARS", description: "Peso argentino" },
        ],
      });

      await user.click(
        screen.getByRole("button", { name: /eliminar moneda USD/i }),
      );

      await waitFor(() =>
        expect(screen.queryByText("Dólar")).not.toBeInTheDocument(),
      );
      expect(screen.getByText("Peso argentino")).toBeInTheDocument();
    });
  });

  describe("navegación", () => {
    it("llama onPrev al hacer click en Volver", async () => {
      const user = userEvent.setup();
      const onPrev = vi.fn();
      renderMoneda(vi.fn(), onPrev);

      await user.click(screen.getByText("Volver"));

      expect(onPrev).toHaveBeenCalledTimes(1);
    });

    it("llama onNext con las monedas actuales al hacer click en Siguiente", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderMoneda(onNext, vi.fn(), {
        currenciesToAdd: [{ symbol: "USD", description: "Dólar" }],
      });

      await user.click(screen.getByText("Siguiente"));

      expect(onNext).toHaveBeenCalledWith({
        currenciesToAdd: [{ symbol: "USD", description: "Dólar" }],
      });
    });

    it("llama onNext con array vacío si no hay monedas", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderMoneda(onNext);

      await user.click(screen.getByText("Siguiente"));

      expect(onNext).toHaveBeenCalledWith({ currenciesToAdd: [] });
    });
  });
});
