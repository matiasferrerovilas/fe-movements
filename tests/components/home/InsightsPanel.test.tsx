import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import InsightsPanel from "@/components/home/InsightsPanel";
import type { CategoryInsight } from "@/models/Insight";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockUserDefault = { value: "ws-1" };

const mockInsights: CategoryInsight[] = [
  {
    category: "Alimentación",
    direction: "ABOVE",
    percentDeviation: 25,
    currentAmount: 50000,
    averageAmount: 40000,
    currency: "ARS",
  },
];

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("InsightsPanel", () => {
  it("notifica visible=true y renderiza la card cuando hay insights", async () => {
    server.use(
      http.get("*/settings/defaults/DEFAULT_WORKSPACE", () =>
        HttpResponse.json(mockUserDefault),
      ),
      http.get("*/insights", () => HttpResponse.json(mockInsights)),
    );

    const onVisibilityChange = vi.fn();
    renderWithProviders(
      <InsightsPanel onVisibilityChange={onVisibilityChange} />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Alimentación/)).toBeInTheDocument();
    });
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);
  });

  it("notifica visible=false y no renderiza nada cuando no hay insights", async () => {
    server.use(
      http.get("*/settings/defaults/DEFAULT_WORKSPACE", () =>
        HttpResponse.json(mockUserDefault),
      ),
      http.get("*/insights", () => HttpResponse.json([])),
    );

    const onVisibilityChange = vi.fn();
    const { container } = renderWithProviders(
      <InsightsPanel onVisibilityChange={onVisibilityChange} />,
    );

    await waitFor(() => {
      expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
    });
    expect(container).toBeEmptyDOMElement();
  });
});
