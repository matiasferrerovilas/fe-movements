import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import TopCategorias from "../../../src/components/home/TopCategorias";
import type { BalanceByCategory } from "../../../src/models/BalanceByCategory";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockBalanceData: BalanceByCategory[] = [
  {
    category: "Vivienda",
    year: 2026,
    currencySymbol: "ARS",
    total: 50000,
  },
  {
    category: "Alimentación",
    year: 2026,
    currencySymbol: "ARS",
    total: 30000,
  },
  {
    category: "Transporte",
    year: 2026,
    currencySymbol: "ARS",
    total: 20000,
  },
  {
    category: "Entretenimiento",
    year: 2026,
    currencySymbol: "ARS",
    total: 15000,
  },
  {
    category: "Salud",
    year: 2026,
    currencySymbol: "ARS",
    total: 10000,
  },
  {
    category: "Educación",
    year: 2026,
    currencySymbol: "ARS",
    total: 5000,
  },
];

const mockCurrencies = [
  { id: "1", symbol: "ARS", name: "Peso Argentino" },
  { id: "2", symbol: "USD", name: "Dólar" },
];

const mockUserDefault = { value: "1" };

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("TopCategorias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra skeleton mientras carga los datos", () => {
    server.use(
      http.get("*/balance/category", () => {
        return new Promise(() => {}); // Never resolves
      }),
      http.get("*/currencies", () => HttpResponse.json(mockCurrencies)),
      http.get("*/settings/default/DEFAULT_CURRENCY", () =>
        HttpResponse.json(mockUserDefault),
      ),
    );

    renderWithProviders(<TopCategorias />);

    expect(screen.getByText("Top Categorías del Mes")).toBeInTheDocument();
  });

  it("muestra mensaje cuando no hay datos", async () => {
    server.use(
      http.get("*/balance/category", () => HttpResponse.json([])),
      http.get("*/currencies", () => HttpResponse.json(mockCurrencies)),
      http.get("*/settings/default/DEFAULT_CURRENCY", () =>
        HttpResponse.json(mockUserDefault),
      ),
    );

    renderWithProviders(<TopCategorias />);

    await waitFor(() => {
      expect(
        screen.getByText("Sin gastos registrados este mes"),
      ).toBeInTheDocument();
    });
  });

  it("muestra top 5 categorías con mayor gasto", async () => {
    server.use(
      http.get("*/balance/category", () =>
        HttpResponse.json(mockBalanceData),
      ),
      http.get("*/currencies", () => HttpResponse.json(mockCurrencies)),
      http.get("*/settings/default/DEFAULT_CURRENCY", () =>
        HttpResponse.json(mockUserDefault),
      ),
    );

    renderWithProviders(<TopCategorias />);

    await waitFor(() => {
      expect(screen.getByText(/Vivienda/)).toBeInTheDocument();
      expect(screen.getByText(/Alimentación/)).toBeInTheDocument();
      expect(screen.getByText(/Transporte/)).toBeInTheDocument();
      expect(screen.getByText(/Entretenimiento/)).toBeInTheDocument();
      expect(screen.getByText(/Salud/)).toBeInTheDocument();
    });

    // No debe mostrar la 6ta categoría (Educación)
    expect(screen.queryByText(/Educación/)).not.toBeInTheDocument();
  });

  it("muestra montos y porcentajes correctamente", async () => {
    server.use(
      http.get("*/balance/category", () =>
        HttpResponse.json(mockBalanceData),
      ),
      http.get("*/currencies", () => HttpResponse.json(mockCurrencies)),
      http.get("*/settings/default/DEFAULT_CURRENCY", () =>
        HttpResponse.json(mockUserDefault),
      ),
    );

    renderWithProviders(<TopCategorias />);

    await waitFor(() => {
      // Vivienda: 50000 / (50000+30000+20000+15000+10000) = 40%
      expect(screen.getByText(/\$50\.000/)).toBeInTheDocument();
      expect(screen.getByText(/\(40\.0%\)/)).toBeInTheDocument();
    });
  });

  it("ordena categorías por total descendente", async () => {
    const unorderedData = [
      {
        category: "C",
        year: 2026,
        currencySymbol: "ARS",
        total: 10000,
      },
      {
        category: "A",
        year: 2026,
        currencySymbol: "ARS",
        total: 30000,
      },
      {
        category: "B",
        year: 2026,
        currencySymbol: "ARS",
        total: 20000,
      },
    ];

    server.use(
      http.get("*/balance/category", () => HttpResponse.json(unorderedData)),
      http.get("*/currencies", () => HttpResponse.json(mockCurrencies)),
      http.get("*/settings/default/DEFAULT_CURRENCY", () =>
        HttpResponse.json(mockUserDefault),
      ),
    );

    renderWithProviders(<TopCategorias />);

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("A");
      expect(items[1]).toHaveTextContent("B");
      expect(items[2]).toHaveTextContent("C");
    });
  });
});
