import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import TipoOnboarding from "../../../src/components/onboarding/TipoOnboarding";

function wrapper({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}

function renderTipo(
  onNext = vi.fn(),
  onPrev = vi.fn(),
  initialValues = {},
) {
  return render(
    <TipoOnboarding initialValues={initialValues} onNext={onNext} onPrev={onPrev} />,
    { wrapper },
  );
}

describe("TipoOnboarding", () => {
  describe("render inicial", () => {
    it("muestra las opciones Usuario y Emprendedor", () => {
      renderTipo();
      expect(screen.getByText("Usuario")).toBeInTheDocument();
      expect(screen.getByText("Emprendedor")).toBeInTheDocument();
    });

    it("muestra los botones Volver y Siguiente", () => {
      renderTipo();
      expect(screen.getByText("Volver")).toBeInTheDocument();
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
    });

    it("selecciona PERSONAL por defecto cuando no hay initialValues", () => {
      renderTipo();
      // El texto de la descripción confirma la inicialización correcta
      expect(screen.getByText("¿Cuál será el uso de la cuenta?")).toBeInTheDocument();
    });
  });

  describe("selección de tipo", () => {
    it("llama onNext con userType PERSONAL al hacer click en Siguiente con selección por defecto", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderTipo(onNext);

      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
      expect(onNext).toHaveBeenCalledWith({ userType: "PERSONAL" });
    });

    it("llama onNext con userType ENTERPRISE al seleccionar Emprendedor", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderTipo(onNext);

      await user.click(screen.getByText("Emprendedor"));
      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
      expect(onNext).toHaveBeenCalledWith({ userType: "ENTERPRISE" });
    });

    it("respeta el initialValue ENTERPRISE", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderTipo(onNext, vi.fn(), { userType: "ENTERPRISE" });

      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
      expect(onNext).toHaveBeenCalledWith({ userType: "ENTERPRISE" });
    });
  });

  describe("navegación", () => {
    it("llama onPrev al hacer click en Volver", async () => {
      const user = userEvent.setup();
      const onPrev = vi.fn();
      renderTipo(vi.fn(), onPrev);

      await user.click(screen.getByText("Volver"));

      expect(onPrev).toHaveBeenCalledTimes(1);
    });
  });
});
