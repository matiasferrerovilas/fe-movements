import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MutableRefObject, ReactNode } from "react";
import NavTour from "../../src/components/NavTour";

// Mock the useTour hook
const mockMutate = vi.fn();
vi.mock("../../src/apis/hooks/useTour", () => ({
  useMarkTourSeen: () => ({
    mutate: mockMutate,
  }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("NavTour", () => {
  const createMockRefsMap = () => {
    // Create actual DOM elements for refs
    const balance = document.createElement("button");
    balance.textContent = "Balance";
    document.body.appendChild(balance);

    const servicios = document.createElement("button");
    servicios.textContent = "Servicios";
    document.body.appendChild(servicios);

    const budgets = document.createElement("button");
    budgets.textContent = "Presupuestos";
    document.body.appendChild(budgets);

    const expenses = document.createElement("button");
    expenses.textContent = "Gastos";
    document.body.appendChild(expenses);

    const settings = document.createElement("button");
    settings.textContent = "Ajustes";
    document.body.appendChild(settings);

    const elements = { balance, servicios, budgets, expenses, settings };

    const navRefsMap: MutableRefObject<Record<string, HTMLButtonElement | null>> = {
      current: {
        balance,
        servicios,
        budgets,
        expenses,
        settings,
      },
    };

    return { elements, navRefsMap };
  };

  let mockElements: ReturnType<typeof createMockRefsMap>["elements"];
  let mockNavRefsMap: ReturnType<typeof createMockRefsMap>["navRefsMap"];

  beforeEach(() => {
    vi.clearAllMocks();
    const created = createMockRefsMap();
    mockElements = created.elements;
    mockNavRefsMap = created.navRefsMap;
  });

  afterEach(() => {
    // Cleanup DOM elements
    Object.values(mockElements).forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  it("should render tour when open is true", () => {
    render(
      <NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} hasAdmin={false} />,
      { wrapper: makeWrapper() },
    );

    // First step should show Balance title in the tour
    expect(screen.getByText(/Visualiza el resumen de tus ingresos/)).toBeInTheDocument();
    // Check the tour title specifically
    expect(document.querySelector(".ant-tour-title")).toHaveTextContent("Balance");
  });

  it("should not render tour when open is false", () => {
    render(
      <NavTour open={false} onClose={vi.fn()} navRefsMap={mockNavRefsMap} hasAdmin={false} />,
      { wrapper: makeWrapper() },
    );

    // Tour content should not be visible
    expect(
      screen.queryByText(/Visualiza el resumen de tus ingresos/),
    ).not.toBeInTheDocument();
  });

  it("should call onClose and markSeen when tour is closed via X button", async () => {
    const onClose = vi.fn();
    render(
      <NavTour open={true} onClose={onClose} navRefsMap={mockNavRefsMap} hasAdmin={false} />,
      { wrapper: makeWrapper() },
    );

    // Find and click the close button (X)
    const closeButton = document.querySelector(".ant-tour-close");
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should show step indicator with correct format", () => {
    render(
      <NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} hasAdmin={false} />,
      { wrapper: makeWrapper() },
    );

    // Should show "1 / 5" for first step (5 items without admin)
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("should have 6 steps when hasAdmin is true", async () => {
    const admin = document.createElement("button");
    admin.textContent = "Admin";
    document.body.appendChild(admin);

    mockNavRefsMap.current.admin = admin;

    render(
      <NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} hasAdmin={true} />,
      { wrapper: makeWrapper() },
    );

    // Should show "1 / 6" for first step (6 items with admin)
    expect(screen.getByText("1 / 6")).toBeInTheDocument();

    // Cleanup
    admin.parentNode?.removeChild(admin);
  });

  it("should navigate through steps when clicking next", async () => {
    render(
      <NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} hasAdmin={false} />,
      { wrapper: makeWrapper() },
    );

    // First step
    expect(screen.getByText("1 / 5")).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Should be on second step
    await waitFor(() => {
      expect(screen.getByText("2 / 5")).toBeInTheDocument();
    });
  });
});
