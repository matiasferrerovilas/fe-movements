import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Investment } from "../../../src/models/Investment";
import { InvestmentDashboard } from "../../../src/components/investments/InvestmentDashboard";

function makeInvestment(id: number, amount: number): Investment {
  return {
    id,
    description: `TICKER${id}`,
    investmentType: { id: 1, name: "Acciones", workspaceId: 1 },
    amount,
    startDate: "2025-01-01",
    endDate: null,
    currency: { id: 1, symbol: "USD", description: "Dólar" },
    workspaceName: "Familia",
    owner: "Test User",
  };
}

describe("InvestmentDashboard", () => {
  it("renders Total invertido label", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);
    expect(screen.getByText("Total invertido")).toBeInTheDocument();
  });

  it("renders data-testid total-invertido", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);
    expect(screen.getByTestId("total-invertido")).toBeInTheDocument();
  });

  it("shows 0 when investments list is empty", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);
    expect(screen.getByTestId("total-invertido")).toHaveTextContent("0");
  });

  it("calculates total invertido as sum of amounts", () => {
    const investments = [makeInvestment(1, 100), makeInvestment(2, 200)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);
    expect(screen.getByTestId("total-invertido").textContent).toMatch(/300/);
  });

  it("shows loading skeleton when isFetching is true", () => {
    render(<InvestmentDashboard investments={[]} isFetching={true} />);
    expect(screen.queryByTestId("total-invertido")).not.toBeInTheDocument();
  });

  it("handles single investment amount", () => {
    const investments = [makeInvestment(1, 750)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);
    expect(screen.getByTestId("total-invertido").textContent).toMatch(/750/);
  });

  it("uses amount field for total calculation", () => {
    const investments = [makeInvestment(1, 0)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);
    expect(screen.getByTestId("total-invertido")).toHaveTextContent("0");
  });
});
