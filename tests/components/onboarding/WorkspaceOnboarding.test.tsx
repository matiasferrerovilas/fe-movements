import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import WorkspaceOnboarding from "../../../src/components/onboarding/WorkspaceOnboarding";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}

function renderWorkspace(onNext = vi.fn()) {
  return render(<WorkspaceOnboarding initialValues={{}} onNext={onNext} />, { wrapper });
}

describe("WorkspaceOnboarding", () => {
  describe("render inicial", () => {
    it("muestra el texto descriptivo", () => {
      renderWorkspace();
      expect(screen.getByText(/querés crear algunos workspaces/i)).toBeInTheDocument();
    });

    it("muestra un input vacío por defecto", () => {
      renderWorkspace();
      expect(screen.getByPlaceholderText("Ej: Familia, Trabajo, Personal...")).toBeInTheDocument();
    });

    it("muestra solo el botón Siguiente (sin Omitir)", () => {
      renderWorkspace();
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
      expect(screen.queryByText("Omitir por ahora")).not.toBeInTheDocument();
    });
  });

  describe("agregar y eliminar workspaces", () => {
    it("agrega un nuevo input al hacer click en Crear workspace", async () => {
      const user = userEvent.setup();
      renderWorkspace();

      await user.click(screen.getByText("Crear workspace"));

      const inputs = screen.getAllByPlaceholderText("Ej: Familia, Trabajo, Personal...");
      expect(inputs).toHaveLength(2);
    });

    it("muestra el botón de eliminar cuando hay más de un campo", async () => {
      const user = userEvent.setup();
      renderWorkspace();

      await user.click(screen.getByText("Crear workspace"));

      expect(screen.getAllByRole("button", { name: /Eliminar workspace/i })).toHaveLength(2);
    });

    it("no muestra botón de eliminar cuando solo hay un campo", () => {
      renderWorkspace();
      expect(screen.queryByRole("button", { name: /Eliminar workspace/i })).not.toBeInTheDocument();
    });
  });

  describe("validación", () => {
    it("rechaza nombres con números o símbolos", async () => {
      const user = userEvent.setup();
      renderWorkspace();

      await user.type(screen.getByPlaceholderText("Ej: Familia, Trabajo, Personal..."), "Grupo1!");
      await user.click(screen.getByText("Siguiente"));

      await waitFor(() =>
        expect(screen.getByText("Solo se permiten letras y espacios")).toBeInTheDocument(),
      );
    });

    it("avanza con los grupos completados al escribir nombres válidos", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderWorkspace(onNext);

      await user.type(screen.getByPlaceholderText("Ej: Familia, Trabajo, Personal..."), "Familia");
      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
      expect(onNext).toHaveBeenCalledWith({ accountsToAdd: ["Familia"] });
    });

    it("avanza con accountsToAdd vacío cuando el campo está vacío", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderWorkspace(onNext);

      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
      expect(onNext).toHaveBeenCalledWith({ accountsToAdd: [] });
    });
  });

  describe("Omitir", () => {
    it("no existe el botón Omitir por ahora", () => {
      renderWorkspace();
      expect(screen.queryByText("Omitir por ahora")).not.toBeInTheDocument();
    });
  });
});
