import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Investment } from "../../../src/models/Investment";
import { InvestmentTable } from "../../../src/components/investments/InvestmentTable";

function makeInvestment(id: number): Investment {
  return {
    id,
    instrumento: `TICKER${id}`,
    tipo: { id: 1, description: "Acciones", iconColor: "#52c41a" },
    montoInvertido: 1000,
    valorActual: 1200,
    fechaInversion: "2025-01-15",
    moneda: { id: 1, symbol: "USD", description: "Dólar" },
    account: { id: 10, name: "Familia" },
  };
}

describe("InvestmentTable", () => {
  it("renders a row for each investment", () => {
    const investments = [makeInvestment(1), makeInvestment(2)];
    render(
      <InvestmentTable
        investments={investments}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("TICKER1")).toBeInTheDocument();
    expect(screen.getByText("TICKER2")).toBeInTheDocument();
  });

  it("shows tipo description for each row", () => {
    render(
      <InvestmentTable
        investments={[makeInvestment(1)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("calls onEdit with the correct investment when edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const investment = makeInvestment(1);

    render(
      <InvestmentTable
        investments={[investment]}
        isFetching={false}
        onEdit={onEdit}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    expect(onEdit).toHaveBeenCalledWith(investment);
  });

  it("calls onDelete with the correct id when delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <InvestmentTable
        investments={[makeInvestment(5)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={onDelete}
        isDeleting={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith(5);
  });

  it("renders empty state when investments list is empty", () => {
    render(
      <InvestmentTable
        investments={[]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText(/sin inversiones/i)).toBeInTheDocument();
  });

  it("shows positive gain in green color class", () => {
    render(
      <InvestmentTable
        investments={[makeInvestment(1)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    const gainCell = screen.getByTestId("gp-1");
    expect(gainCell).toHaveStyle({ color: "#3f8600" });
  });
});
