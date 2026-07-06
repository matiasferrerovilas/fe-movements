import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { InvestmentType } from "@/models/InvestmentType";
import type { Currency } from "@/models/Currency";
import type { Investment } from "@/models/Investment";
import { InvestmentForm } from "@/components/investments/InvestmentForm";

const mockTypes: InvestmentType[] = [
  { id: 1, name: "Acciones", workspaceId: 1 },
  { id: 2, name: "FCI", workspaceId: 1 },
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

    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Monto invertido")).toBeInTheDocument();
    expect(screen.getByText("Moneda")).toBeInTheDocument();
    expect(screen.getByText("Fecha de inicio")).toBeInTheDocument();
  });

  it("shows 'Nueva inversión' title in create mode", () => {
    render(<InvestmentForm {...defaultProps} />);

    expect(screen.getByText("Nueva inversión")).toBeInTheDocument();
  });

  it("shows 'Editar inversión' title when investment prop is provided", () => {
    const investment: Investment = {
      id: 1,
      description: "AAPL",
      investmentType: { id: 1, name: "Acciones", workspaceId: 1 },
      amount: 1000,
      startDate: "2025-01-01",
      endDate: null,
      currency: { id: 1, symbol: "USD", description: "Dólar" },
      workspaceName: "Familia",
      owner: "Test User",
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

  it("shows validation error when required fields are empty and form is submitted", async () => {
    const user = userEvent.setup();
    render(<InvestmentForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /agregar/i }));

    expect(
      await screen.findByText("Ingresá el monto"),
    ).toBeInTheDocument();
  });
});
