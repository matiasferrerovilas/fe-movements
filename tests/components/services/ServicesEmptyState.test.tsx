import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import ServicesEmptyState from "@/components/services/ServicesEmptyState";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

vi.mock("@/apis/hooks/useCurrency", () => ({
  useCurrency: () => ({ data: [{ id: 1, symbol: "ARS", description: "Peso argentino" }] }),
}));

vi.mock("@/apis/hooks/useSettings", () => ({
  useUserDefault: () => ({ data: undefined }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("ServicesEmptyState", () => {
  it("renders the title, subtitle and the embedded add-service form", () => {
    render(<ServicesEmptyState onAddService={vi.fn()} />, { wrapper: makeWrapper() });

    expect(screen.getByText("¿Empezamos?")).toBeInTheDocument();
    expect(
      screen.getByText(/Todavía no cargaste ningún servicio/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Agregar Servicio/i })).toBeInTheDocument();
  });
});
