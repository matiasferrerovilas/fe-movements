import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../src/apis/auth/protectedRouteGuard", () => ({
  protectedRouteGuard: () => () => undefined,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: ReactNode }) => opts,
}));

// ── Import después de mocks ────────────────────────────────────────────────

const { Route } = await import("../../src/routes/admin");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RouteComponent = (Route as any).component as React.FC;

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderAdmin() {
  return render(<RouteComponent />, { wrapper: makeWrapper() });
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Admin route", () => {
  describe("header", () => {
    it("renderiza el título 'Panel de administración'", () => {
      renderAdmin();

      expect(screen.getByText("Panel de administración")).toBeInTheDocument();
    });

    it("renderiza el subtítulo de solo admin", () => {
      renderAdmin();

      expect(
        screen.getByText("Solo visible para administradores"),
      ).toBeInTheDocument();
    });
  });

  describe("tabs", () => {
    it("renderiza la tab 'Mantenimiento'", () => {
      renderAdmin();

      expect(screen.getByText("Mantenimiento")).toBeInTheDocument();
    });

    it("la tab activa por defecto muestra el placeholder de sin acciones", () => {
      renderAdmin();

      expect(
        screen.getByText("Sin acciones configuradas"),
      ).toBeInTheDocument();
    });

    it("muestra el texto de ayuda del placeholder", () => {
      renderAdmin();

      expect(
        screen.getByText("Agregá acciones de mantenimiento acá."),
      ).toBeInTheDocument();
    });
  });

  describe("guard de rol", () => {
    it("protectedRouteGuard se configura con roles: [ADMIN] — el beforeLoad del Route existe", () => {
      // El mock de protectedRouteGuard devuelve () => undefined.
      // Si el beforeLoad está definido, el guard fue invocado al importar la ruta.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(typeof (Route as any).beforeLoad).toBe("function");
    });
  });

  describe("tab switch", () => {
    it("al hacer click en 'Mantenimiento' sigue mostrando el placeholder", async () => {
      const user = userEvent.setup();
      renderAdmin();

      await user.click(screen.getByText("Mantenimiento"));

      expect(
        screen.getByText("Sin acciones configuradas"),
      ).toBeInTheDocument();
    });
  });
});
