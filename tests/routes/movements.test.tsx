import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useEffect, type ReactNode } from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

let mockTableState: { isLoading: boolean; hasMovements: boolean } = {
  isLoading: true,
  hasMovements: false,
};

vi.mock("@/apis/auth/protectedRouteGuard", () => ({
  protectedRouteGuard: () => () => undefined,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: ReactNode }) => opts,
}));

vi.mock("@/components/movements/MovementFilters", () => ({
  default: () => <div data-testid="movement-filters">MovementFilters</div>,
}));

vi.mock("@/components/modals/movements/AddMovementModal", () => ({
  default: () => <div data-testid="add-movement-modal">AddMovementModal</div>,
}));

function MockMovementTable({
  onStateChange,
}: {
  onStateChange?: (state: { isLoading: boolean; hasMovements: boolean }) => void;
}) {
  useEffect(() => {
    onStateChange?.(mockTableState);
  }, [onStateChange]);
  return <div data-testid="movement-table">MovementTable</div>;
}

vi.mock("@/components/movements/tables/MovementTable", () => ({
  default: MockMovementTable,
}));

// ── Import después de mocks ────────────────────────────────────────────────

const { Route } = await import("@/routes/movements");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RouteComponent = (Route as any).component as React.FC;

import React from "react";

// ── Helpers ────────────────────────────────────────────────────────────────

function renderMovements() {
  return render(<RouteComponent />);
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Movements route — visibilidad de la barra de filtros", () => {
  it("oculta la barra de filtros mientras el estado de carga es desconocido", async () => {
    mockTableState = { isLoading: true, hasMovements: false };
    renderMovements();

    await waitFor(() => expect(screen.getByTestId("movement-table")).toBeInTheDocument());
    expect(screen.queryByTestId("movement-filters")).not.toBeInTheDocument();
  });

  it("oculta la barra de filtros cuando la cuenta no tiene movimientos", async () => {
    mockTableState = { isLoading: false, hasMovements: false };
    renderMovements();

    await waitFor(() => expect(screen.getByTestId("movement-table")).toBeInTheDocument());
    expect(screen.queryByTestId("movement-filters")).not.toBeInTheDocument();
  });

  it("muestra la barra de filtros cuando hay movimientos", async () => {
    mockTableState = { isLoading: false, hasMovements: true };
    renderMovements();

    await waitFor(() => expect(screen.getByTestId("movement-filters")).toBeInTheDocument());
  });
});
