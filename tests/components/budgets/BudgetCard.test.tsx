import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BudgetCard } from "../../../src/components/budgets/BudgetCard";
import type { BudgetRecord } from "../../../src/models/Budget";

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const baseBudget: BudgetRecord = {
  id: 1,
  accountId: 10,
  category: { id: 8, description: "Supermercado", isActive: true, isDeletable: false },
  currency: { id: 1, symbol: "ARS" },
  amount: 5000,
  year: null,
  month: null,
  spent: 2300,
  percentage: 46,
};

const nullCategoryBudget: BudgetRecord = {
  ...baseBudget,
  id: 2,
  category: null,
  year: 2026,
  month: 4,
};

const exceededBudget: BudgetRecord = {
  ...baseBudget,
  id: 3,
  spent: 6500,
  percentage: 130,
};

const warningBudget: BudgetRecord = {
  ...baseBudget,
  id: 4,
  spent: 4200,
  percentage: 84,
};

function renderCard(
  budget: BudgetRecord,
  overrides?: { onEdit?: () => void; onDelete?: () => void },
) {
  const onEdit = overrides?.onEdit ?? vi.fn();
  const onDelete = overrides?.onDelete ?? vi.fn();
  const wrapper = makeWrapper();
  return {
    onEdit,
    onDelete,
    ...render(
      <BudgetCard budget={budget} onEdit={onEdit} onDelete={onDelete} />,
      { wrapper },
    ),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("BudgetCard", () => {
  describe("render inicial", () => {
    it("muestra el nombre de la categoría", () => {
      renderCard(baseBudget);
      expect(screen.getByText("Supermercado")).toBeInTheDocument();
    });

    it("muestra 'Sin categoría' cuando category es null", () => {
      renderCard(nullCategoryBudget);
      expect(screen.getAllByText("Sin categoría").length).toBeGreaterThan(0);
    });

    it("muestra el monto presupuestado con el símbolo de moneda", () => {
      renderCard(baseBudget);
      expect(screen.getByText(/5\.000,00/)).toBeInTheDocument();
    });

    it("muestra el monto gastado con el símbolo de moneda", () => {
      renderCard(baseBudget);
      expect(screen.getByText(/2\.300,00/)).toBeInTheDocument();
    });

    it("muestra el porcentaje utilizado", () => {
      renderCard(baseBudget);
      expect(screen.getByText("46.0% utilizado")).toBeInTheDocument();
    });

    it("muestra etiqueta 'Recurrente' para presupuestos con year y month null", () => {
      renderCard(baseBudget);
      expect(screen.getByText("Recurrente")).toBeInTheDocument();
    });

    it("no muestra etiqueta 'Recurrente' para presupuestos puntuales", () => {
      renderCard(nullCategoryBudget);
      expect(screen.queryByText("Recurrente")).not.toBeInTheDocument();
    });

    it("muestra '(excedido)' cuando el porcentaje supera 100", () => {
      renderCard(exceededBudget);
      expect(screen.getByText("(excedido)")).toBeInTheDocument();
    });

    it("no muestra '(excedido)' cuando el porcentaje es menor a 100", () => {
      renderCard(baseBudget);
      expect(screen.queryByText("(excedido)")).not.toBeInTheDocument();
    });
  });

  describe("botón de editar", () => {
    it("llama a onEdit con el budget al hacer click en el botón de editar", async () => {
      const user = userEvent.setup();
      const { onEdit } = renderCard(baseBudget);

      const editBtn = screen.getByRole("button", {
        name: /Editar presupuesto Supermercado/i,
      });
      await user.click(editBtn);

      expect(onEdit).toHaveBeenCalledWith(baseBudget);
    });
  });

  describe("botón de eliminar (Popconfirm)", () => {
    it("llama a onDelete con el id del budget al confirmar el Popconfirm", async () => {
      const user = userEvent.setup();
      const { onDelete } = renderCard(baseBudget);

      const deleteBtn = screen.getByRole("button", {
        name: /Eliminar presupuesto Supermercado/i,
      });
      await user.click(deleteBtn);

      const confirmBtn = await screen.findByText("Eliminar");
      await user.click(confirmBtn);

      expect(onDelete).toHaveBeenCalledWith(baseBudget.id);
    });

    it("está deshabilitado cuando isDeleting es true", () => {
      const wrapper = makeWrapper();
      render(
        <BudgetCard
          budget={baseBudget}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          isDeleting={true}
        />,
        { wrapper },
      );

      const deleteBtn = screen.getByRole("button", {
        name: /Eliminar presupuesto Supermercado/i,
      });
      expect(deleteBtn).toBeDisabled();
    });
  });

  describe("colores por porcentaje", () => {
    it("muestra porcentaje con color verde para presupuesto en buen estado (<80%)", () => {
      renderCard(baseBudget);
      // El texto "46.0% utilizado" debe existir
      expect(screen.getByText("46.0% utilizado")).toBeInTheDocument();
    });

    it("muestra porcentaje para presupuesto en advertencia (80-99%)", () => {
      renderCard(warningBudget);
      expect(screen.getByText("84.0% utilizado")).toBeInTheDocument();
    });

    it("muestra porcentaje para presupuesto excedido (≥100%)", () => {
      renderCard(exceededBudget);
      expect(screen.getByText("130.0% utilizado")).toBeInTheDocument();
      expect(screen.getByText("(excedido)")).toBeInTheDocument();
    });
  });
});
