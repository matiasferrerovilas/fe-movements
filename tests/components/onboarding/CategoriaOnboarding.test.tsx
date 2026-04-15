import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import CategoriaOnboarding from "../../../src/components/onboarding/CategoriaOnboarding";

// ── Mock useCurrentUser ────────────────────────────────────────────────────
vi.mock("../../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "CONSUMER" },
    isLoading: false,
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}

function renderCategoria(
  onNext = vi.fn(),
  onPrev = vi.fn(),
  initialValues: { categoriesToAdd?: string[] } = {},
) {
  return render(
    <CategoriaOnboarding
      initialValues={initialValues}
      onNext={onNext}
      onPrev={onPrev}
    />,
    { wrapper },
  );
}

describe("CategoriaOnboarding", () => {
  describe("render inicial", () => {
    it("muestra el texto descriptivo", () => {
      renderCategoria();
      expect(
        screen.getByText(/agregá las categorías con las que clasificás tus gastos/i),
      ).toBeInTheDocument();
    });

    it("muestra el input de nombre de categoría", () => {
      renderCategoria();
      expect(
        screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento..."),
      ).toBeInTheDocument();
    });

    it("muestra los botones Volver y Siguiente", () => {
      renderCategoria();
      expect(screen.getByText("Volver")).toBeInTheDocument();
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
    });

    it("muestra estado vacío cuando no hay categorías", () => {
      renderCategoria();
      expect(
        screen.getByText(/no agregaste categorías aún/i),
      ).toBeInTheDocument();
    });

    it("muestra las categorías pre-cargadas desde initialValues", () => {
      renderCategoria(vi.fn(), vi.fn(), { categoriesToAdd: ["COMIDA", "TRANSPORTE"] });
      expect(screen.getByText("Comida")).toBeInTheDocument();
      expect(screen.getByText("Transporte")).toBeInTheDocument();
    });
  });

  describe("agregar categorías", () => {
    it("agrega una categoría al hacer click en Agregar", async () => {
      const user = userEvent.setup();
      renderCategoria();

      await user.type(screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento..."), "Comida");
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(screen.getByText("Comida")).toBeInTheDocument(),
      );
    });

    it("convierte el nombre a mayúsculas internamente y lo muestra capitalizado", async () => {
      const user = userEvent.setup();
      renderCategoria();

      await user.type(screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento..."), "transporte");
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(screen.getByText("Transporte")).toBeInTheDocument(),
      );
    });

    it("limpia el input después de agregar", async () => {
      const user = userEvent.setup();
      renderCategoria();

      await user.type(screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento..."), "Viajes");
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      // Re-query after re-render to avoid stale ref
      await waitFor(() =>
        expect(screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento...")).toHaveValue(""),
      );
    });

    it("no agrega una categoría duplicada (case-insensitive)", async () => {
      const user = userEvent.setup();
      renderCategoria(vi.fn(), vi.fn(), { categoriesToAdd: ["COMIDA"] });

      await user.type(screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento..."), "comida");
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() => {
        const tags = screen.getAllByText("Comida");
        expect(tags).toHaveLength(1);
      });
    });
  });

  describe("validación", () => {
    it("muestra error si el campo está vacío al intentar agregar", async () => {
      const user = userEvent.setup();
      renderCategoria();

      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(
          screen.getByText(/ingresá el nombre de la categoría/i),
        ).toBeInTheDocument(),
      );
    });

    it("muestra error si contiene números o símbolos", async () => {
      const user = userEvent.setup();
      renderCategoria();

      await user.type(screen.getByPlaceholderText("Ej: Hogar, Transporte, Entretenimiento..."), "Cat123!");
      await user.click(screen.getByRole("button", { name: /agregar/i }));

      await waitFor(() =>
        expect(screen.getByText("Solo letras y espacios")).toBeInTheDocument(),
      );
    });
  });

  describe("eliminar categorías", () => {
    it("elimina una categoría al hacer click en su icono de cierre", async () => {
      const user = userEvent.setup();
      renderCategoria(vi.fn(), vi.fn(), { categoriesToAdd: ["COMIDA", "TRANSPORTE"] });

      // Ant Design Tag renderiza el closeIcon como un <span role="img" aria-label="Close">
      const closeIcons = screen.getAllByRole("img", { name: /close/i });
      // El primer close pertenece al tag "Comida"
      await user.click(closeIcons[0]);

      await waitFor(() =>
        expect(screen.queryByText("Comida")).not.toBeInTheDocument(),
      );
      // El segundo tag sigue en el DOM
      expect(screen.getByText("Transporte")).toBeInTheDocument();
    });
  });

  describe("navegación", () => {
    it("llama onPrev al hacer click en Volver", async () => {
      const user = userEvent.setup();
      const onPrev = vi.fn();
      renderCategoria(vi.fn(), onPrev);

      await user.click(screen.getByText("Volver"));

      expect(onPrev).toHaveBeenCalledTimes(1);
    });

    it("llama onNext con las categorías actuales al hacer click en Siguiente", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderCategoria(onNext, vi.fn(), { categoriesToAdd: ["COMIDA"] });

      await user.click(screen.getByText("Siguiente"));

      expect(onNext).toHaveBeenCalledWith({ categoriesToAdd: ["COMIDA"] });
    });

    it("llama onNext con array vacío si no hay categorías", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderCategoria(onNext);

      await user.click(screen.getByText("Siguiente"));

      expect(onNext).toHaveBeenCalledWith({ categoriesToAdd: [] });
    });
  });
});
