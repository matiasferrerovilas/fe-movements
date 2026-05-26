import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Investment } from "../../../src/models/Investment";
import { InvestmentDashboard } from "../../../src/components/investments/InvestmentDashboard";

function makeInvestment(id: number, montoInvertido: number, valorActual: number): Investment {
  return {
    id,
    instrumento: `TICKER${id}`,
    tipo: { id: 1, description: "Acciones" },
    montoInvertido,
    valorActual,
    fechaInversion: "2025-01-01",
    moneda: { id: 1, symbol: "USD", description: "Dólar" },
    account: { id: 10, name: "Familia" },
  };
}

describe("InvestmentDashboard", () => {
  it("renders all four KPI card labels", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);

    expect(screen.getByText("Total invertido")).toBeInTheDocument();
    expect(screen.getByText("Valor actual")).toBeInTheDocument();
    expect(screen.getByText("Ganancia / Pérdida")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento")).toBeInTheDocument();
  });

  it("shows zero totals when investments list is empty", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);

    expect(screen.getByTestId("total-invertido")).toHaveTextContent("0");
    expect(screen.getByTestId("valor-actual")).toHaveTextContent("0");
  });

  it("calculates total invertido as sum of montoInvertido", () => {
    const investments = [
      makeInvestment(1, 1000, 1200),
      makeInvestment(2, 500, 600),
    ];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("total-invertido")).toHaveTextContent("1");
    expect(screen.getByTestId("total-invertido")).toHaveTextContent("500");
  });

  it("calculates valor actual as sum of valorActual", () => {
    const investments = [
      makeInvestment(1, 1000, 1200),
      makeInvestment(2, 500, 600),
    ];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("valor-actual")).toHaveTextContent("1");
    expect(screen.getByTestId("valor-actual")).toHaveTextContent("800");
  });

  it("calculates ganancia as valorActual - montoInvertido", () => {
    const investments = [makeInvestment(1, 1000, 1200)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("ganancia")).toHaveTextContent("200");
  });

  it("calculates rendimiento as percentage", () => {
    const investments = [makeInvestment(1, 1000, 1200)];
    render(<InvestmentDashboard investments={investments} isFetching={false} />);

    expect(screen.getByTestId("rendimiento")).toHaveTextContent("20");
  });

  it("shows rendimiento as 0 when no investments", () => {
    render(<InvestmentDashboard investments={[]} isFetching={false} />);

    expect(screen.getByTestId("rendimiento")).toHaveTextContent("0");
  });
});
