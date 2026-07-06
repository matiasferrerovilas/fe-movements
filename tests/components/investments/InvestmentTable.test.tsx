import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Investment } from "@/models/Investment";
import { InvestmentTable } from "@/components/investments/InvestmentTable";

function makeInvestment(id: number): Investment {
  return {
    id,
    description: `TICKER${id}`,
    investmentType: { id: 1, name: "Acciones", iconColor: "#52c41a", workspaceId: 1 },
    amount: 1000,
    startDate: "2025-01-15",
    endDate: null,
    currency: { id: 1, symbol: "USD", description: "Dólar" },
    workspaceName: "Familia",
    owner: "Test User",
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

  it("shows investment type name for each row", () => {
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

  it("calls onDelete with the correct id after confirming in popconfirm", async () => {
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
    await user.click(screen.getByRole("button", { name: /sí/i }));
    expect(onDelete).toHaveBeenCalledWith(5);
  });

  it("shows the currency symbol for each row", () => {
    render(
      <InvestmentTable
        investments={[makeInvestment(1)]}
        isFetching={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText(/USD/)).toBeInTheDocument();
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
});
