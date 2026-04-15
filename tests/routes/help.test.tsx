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

const { Route } = await import("../../src/routes/help");
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

function renderHelp() {
  return render(<RouteComponent />, { wrapper: makeWrapper() });
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Help route — renderizado inicial", () => {
  it("renderiza el título 'Centro de Ayuda'", () => {
    renderHelp();

    expect(screen.getByText("Centro de Ayuda")).toBeInTheDocument();
  });

  it("renderiza el subtítulo descriptivo", () => {
    renderHelp();

    expect(
      screen.getByText("Aprendé a usar todas las funciones de la aplicación"),
    ).toBeInTheDocument();
  });

  it("renderiza las 5 secciones de ayuda", () => {
    renderHelp();

    expect(screen.getByText("¿Qué es un Workspace?")).toBeInTheDocument();
    expect(screen.getByText("Cómo invitar miembros")).toBeInTheDocument();
    expect(screen.getByText("Movimientos y gastos")).toBeInTheDocument();
    expect(screen.getByText("Servicios y suscripciones")).toBeInTheDocument();
    expect(screen.getByText("Balance y reportes")).toBeInTheDocument();
  });

  it("la primera sección (Workspace) está expandida por defecto", () => {
    renderHelp();

    // El contenido de la sección Workspace debe estar visible
    expect(
      screen.getByText(/Un Workspace \(espacio de trabajo\) es el lugar/),
    ).toBeInTheDocument();
  });

  it("renderiza el footer con email de soporte", () => {
    renderHelp();

    expect(
      screen.getByText(/¿Tenés más dudas\? Escribinos a soporte@movements.app/),
    ).toBeInTheDocument();
  });
});

describe("Help route — interacciones con collapse", () => {
  it("al hacer click en otra sección, se expande su contenido", async () => {
    const user = userEvent.setup();
    renderHelp();

    // Click en "Cómo invitar miembros"
    await user.click(screen.getByText("Cómo invitar miembros"));

    // Debe mostrar el contenido de esa sección (el párrafo principal)
    expect(
      screen.getByText(/Solo necesitás su correo electrónico/),
    ).toBeInTheDocument();
  });

  it("cada sección tiene un tip destacado", async () => {
    const user = userEvent.setup();
    renderHelp();

    // La sección Workspace (abierta por defecto) tiene un tip
    expect(
      screen.getByText(/Podés cambiar entre tus workspaces desde el selector/),
    ).toBeInTheDocument();

    // Click en otra sección
    await user.click(screen.getByText("Movimientos y gastos"));

    // Verificar que tiene su tip
    expect(
      screen.getByText(/Usá los filtros de la tabla para buscar movimientos/),
    ).toBeInTheDocument();
  });
});
