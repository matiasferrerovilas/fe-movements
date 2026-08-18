import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { MutableRefObject, ReactNode } from "react";
import NavTour from "@/components/NavTour";

// Mock the useTour hook
const mockMutate = vi.fn();
vi.mock("@/apis/hooks/useTour", () => ({
  useMarkTourSeen: () => ({
    mutate: mockMutate,
  }),
}));

// Mock useCurrentUser
vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn().mockReturnValue({
    data: {
      id: 1,
      email: "test@test.com",
      givenName: "Test",
      familyName: "User",
      userType: "PERSONAL",
      metadata: {
        isFirstLogin: false,
        hasSeenTour: true,
        userRole: ["ROLE_FAMILY"],
      },
    },
    isLoading: false,
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
    const servicios = document.createElement("button");
    servicios.textContent = "Servicios";
    document.body.appendChild(servicios);

    const budgets = document.createElement("button");
    budgets.textContent = "Presupuestos";
    document.body.appendChild(budgets);

    const movements = document.createElement("button");
    movements.textContent = "Movimientos";
    document.body.appendChild(movements);

    const profile = document.createElement("button");
    profile.textContent = "Perfil";
    document.body.appendChild(profile);

    const elements = { servicios, budgets, movements, profile };

    const navRefsMap: MutableRefObject<Record<string, HTMLButtonElement | null>> = {
      current: {
        servicios,
        budgets,
        movements,
        profile,
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
    render(<NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    // First step should show Servicios description (for PERSONAL user type)
    expect(screen.getByText(/Gestiona tus suscripciones y servicios recurrentes/)).toBeInTheDocument();
    // Check the tour title specifically (should be "Servicios" for PERSONAL user type)
    expect(document.querySelector(".ant-tour-title")).toHaveTextContent("Servicios");
  });

  it("should not render tour when open is false", () => {
    render(<NavTour open={false} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    // Tour content should not be visible
    expect(
      screen.queryByText(/Gestiona tus suscripciones y servicios recurrentes/),
    ).not.toBeInTheDocument();
  });

  it("should call onClose and markSeen when tour is closed via X button", async () => {
    const onClose = vi.fn();
    render(<NavTour open={true} onClose={onClose} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

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
    render(<NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    // Should show "1 / 4" for first step (4 items: servicios, presupuestos, movimientos, perfil)
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
  });

  it("should have 4 steps total", () => {
    render(<NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    // Tour should have 4 steps: Servicios, Presupuestos, Movimientos, Perfil
    expect(screen.getByText("1 / 4")).toBeInTheDocument();
  });

  it("should navigate through steps when clicking next", async () => {
    render(<NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    // First step
    expect(screen.getByText("1 / 4")).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Should be on second step
    await waitFor(() => {
      expect(screen.getByText("2 / 4")).toBeInTheDocument();
    });
  });

  it("should show the Movimientos step with the updated title", async () => {
    render(<NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton); // → presupuestos
    fireEvent.click(nextButton); // → movimientos

    await waitFor(() => {
      expect(document.querySelector(".ant-tour-title")).toHaveTextContent("Movimientos");
    });
    expect(
      screen.getByText(/Registra y consulta todos tus movimientos/),
    ).toBeInTheDocument();
  });

  it("should show the final 'Tu perfil' step pointing at the profile menu", async () => {
    render(<NavTour open={true} onClose={vi.fn()} navRefsMap={mockNavRefsMap} />, {
      wrapper: makeWrapper(),
    });

    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton); // → presupuestos
    fireEvent.click(nextButton); // → movimientos
    fireEvent.click(nextButton); // → perfil

    await waitFor(() => {
      expect(document.querySelector(".ant-tour-title")).toHaveTextContent("Tu perfil");
    });
    expect(
      screen.getByText(/Ajustes, Ayuda, Inversiones, Metas de ahorro, Utilidades/),
    ).toBeInTheDocument();
  });
});
