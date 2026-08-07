import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import AnnualEvolution from "@/components/home/AnnualEvolution";
import type { MonthlyEvolutionRecord } from "@/models/Balance";

const STORAGE_KEY = "annualEvolution.selectedCurrencies";

const mockData: MonthlyEvolutionRecord[] = [
  { month: 1, currencySymbol: "ARS", spent: 1000, savings: 200 },
  { month: 2, currencySymbol: "ARS", spent: 2000, savings: 300 },
  { month: 1, currencySymbol: "USD", spent: 100, savings: 20 },
];

const server = setupServer(
  http.get("http://localhost:8080/balance/monthly-evolution", () =>
    HttpResponse.json(mockData),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

async function openFiltersPanel(user: ReturnType<typeof userEvent.setup>) {
  const trigger = await screen.findByText("Filtrar monedas");
  await user.click(trigger);
}

describe("AnnualEvolution — persistencia del filtro de monedas en localStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("selecciona todas las monedas por defecto cuando no hay nada guardado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnualEvolution year={2026} />);

    await openFiltersPanel(user);

    expect(screen.getByRole("checkbox", { name: "ARS" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "USD" })).toBeChecked();
  });

  it("restaura la selección guardada en localStorage al montar", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["ARS"]));
    const user = userEvent.setup();
    renderWithProviders(<AnnualEvolution year={2026} />);

    await openFiltersPanel(user);

    expect(screen.getByRole("checkbox", { name: "ARS" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "USD" })).not.toBeChecked();
  });

  it("guarda en localStorage cuando el usuario destilda una moneda", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnnualEvolution year={2026} />);

    await openFiltersPanel(user);
    await user.click(screen.getByRole("checkbox", { name: "USD" }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(stored).toEqual(["ARS"]);
    });
  });

  it("si la selección guardada no tiene monedas válidas para el año, vuelve a seleccionar todas", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["EUR"]));
    const user = userEvent.setup();
    renderWithProviders(<AnnualEvolution year={2026} />);

    await openFiltersPanel(user);

    expect(screen.getByRole("checkbox", { name: "ARS" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "USD" })).toBeChecked();
  });
});
