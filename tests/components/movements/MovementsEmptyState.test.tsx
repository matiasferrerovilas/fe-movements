import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import MovementsEmptyState from "@/components/movements/MovementsEmptyState";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("MovementsEmptyState", () => {
  it("renders the title, subtitle and call-to-action button", () => {
    render(<MovementsEmptyState />, { wrapper: makeWrapper() });

    expect(screen.getByText("¿Empezamos?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cargar mi primer movimiento/ }),
    ).toBeInTheDocument();
  });
});
