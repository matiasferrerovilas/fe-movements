import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { InvestmentType } from "../../../src/models/InvestmentType";
import type { Currency } from "../../../src/models/Currency";
import { InvestmentForm } from "../../../src/components/investments/InvestmentForm";

const mockTypes: InvestmentType[] = [
  { id: 1, description: "Acciones" },
  { id: 2, description: "FCI" },
];

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "USD", description: "Dólar" },
  { id: 2, symbol: "ARS", description: "Peso" },
];

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  isLoading: false,
  investmentTypes: mockTypes,
  currencies: mockCurrencies,
};

describe("InvestmentForm", () => {
  it("renders the form fields when open", () => {
    render(<InvestmentForm {...defaultProps} />);

    expect(screen.getByLabelText(/instrumento/i)).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Monto invertido")).toBeInTheDocument();
    expect(screen.getByText("Moneda")).toBeInTheDocument();
    expect(screen.getByText("Fecha de inversión")).toBeInTheDocument();
  });

  it("shows 'Nueva inversión' title in create mode", () => {
    render(<InvestmentForm {...defaultProps} />);

    expect(screen.getByText("Nueva inversión")).toBeInTheDocument();
  });

  it("shows 'Editar inversión' title when investment prop is provided", () => {
    const investment = {
      id: 1,
      instrumento: "AAPL",
      tipo: { id: 1, description: "Acciones" },
      montoInvertido: 1000,
      valorActual: 1200,
      fechaInversion: "2025-01-01",
      moneda: { id: 1, symbol: "USD", description: "Dólar" },
      account: { id: 10, name: "Familia" },
    };
    render(<InvestmentForm {...defaultProps} investment={investment} />);

    expect(screen.getByText("Editar inversión")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<InvestmentForm {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows type options in the select", async () => {
    const user = userEvent.setup();
    render(<InvestmentForm {...defaultProps} />);

    await user.click(screen.getByRole("combobox", { name: /tipo/i }));

    expect(await screen.findByText("Acciones")).toBeInTheDocument();
    expect(await screen.findByText("FCI")).toBeInTheDocument();
  });

  it("shows validation error when instrumento is empty and form is submitted", async () => {
    const user = userEvent.setup();
    render(<InvestmentForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /agregar/i }));

    expect(
      await screen.findByText("Ingresá el instrumento"),
    ).toBeInTheDocument();
  });
});
