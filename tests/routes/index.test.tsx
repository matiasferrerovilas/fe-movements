import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeAll, afterEach, afterAll, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Route as IndexRoute } from "../../src/routes/index";

// Mock de Keycloak
vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: {
      authenticated: true,
      token: "mock-token",
      subject: "mock-subject-id",
    },
    initialized: true,
  }),
}));

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockCurrentUser = {
  id: "1",
  email: "test@test.com",
  name: "Test",
  surname: "User",
  userType: "PERSONAL",
};

const mockCurrencies = [
  { id: "1", symbol: "ARS", name: "Peso Argentino" },
  { id: "2", symbol: "USD", name: "Dólar" },
];

const mockUserDefault = { value: "1" };

const mockWorkspaceSummary = {
  porMoneda: [
    {
      currency: "ARS",
      totalIngresado: 100000,
      totalGastado: 80000,
      diferencia: 20000,
      categoriaConMayorGasto: "Vivienda",
      comparacionVsMesAnterior: {
        diferenciaIngreso: 5000,
        diferenciaGasto: 3000,
      },
    },
  ],
  totalUnificadoUSD: {
    totalIngresado: 500,
    totalGastado: 400,
    diferencia: 100,
  },
};

function renderWithRouter(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
  );
}

describe("Index Route (Home Unificado)", () => {
  beforeEach(() => {
    server.use(
      http.get("*/users/me", () => HttpResponse.json(mockCurrentUser)),
      http.get("*/currencies", () => HttpResponse.json(mockCurrencies)),
      http.get("*/settings/default/DEFAULT_CURRENCY", () =>
        HttpResponse.json(mockUserDefault),
      ),
      http.get("*/settings/default/DEFAULT_WORKSPACE", () =>
        HttpResponse.json({ value: "ws-1" }),
      ),
      http.get("*/workspaces/*/summary", () =>
        HttpResponse.json(mockWorkspaceSummary),
      ),
      http.get("*/balance/category", () => HttpResponse.json([])),
      http.get("*/balance/group", () => HttpResponse.json([])),
      http.get("*/balance/monthly-evolution", () => HttpResponse.json([])),
      http.get("*/budgets/user/*", () => HttpResponse.json([])),
    );
  });

  it("renderiza el título de bienvenida", async () => {
    const RouteComponent = IndexRoute.options.component!;
    renderWithRouter(<RouteComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Bienvenido/)).toBeInTheDocument();
    });
  });

  it("renderiza el componente MonthlySummary", async () => {
    const RouteComponent = IndexRoute.options.component!;
    renderWithRouter(<RouteComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Resumen de/)).toBeInTheDocument();
    });
  });

  it("renderiza el componente TopCategorias", async () => {
    const RouteComponent = IndexRoute.options.component!;
    renderWithRouter(<RouteComponent />);

    await waitFor(() => {
      expect(screen.getByText("Top Categorías del Mes")).toBeInTheDocument();
    });
  });

  it("renderiza los filtros colapsables", async () => {
    const RouteComponent = IndexRoute.options.component!;
    renderWithRouter(<RouteComponent />);

    await waitFor(() => {
      expect(
        screen.getByText("Filtros de Análisis Avanzado"),
      ).toBeInTheDocument();
    });
  });

  it("renderiza los gráficos de análisis", async () => {
    const RouteComponent = IndexRoute.options.component!;
    renderWithRouter(<RouteComponent />);

    await waitFor(() => {
      expect(screen.getByText("Gastos por Categoría")).toBeInTheDocument();
      expect(screen.getByText("Gastos por Workspace")).toBeInTheDocument();
      expect(screen.getByText("Evolución Anual de Gastos")).toBeInTheDocument();
    });
  });
});
