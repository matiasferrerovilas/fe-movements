import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import BalanceCard from "../../../src/components/balance/BalanceCard";
import PlusOutlined from "@ant-design/icons/PlusOutlined";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("BalanceCard", () => {
  it("renders the title and subtitle", () => {
    render(
      <BalanceCard
        title="Ingresos Totales"
        amount={1500}
        subtitle="Ene 2026 · ARS"
        icon={<PlusOutlined />}
        isFetching={false}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("Ingresos Totales")).toBeInTheDocument();
    expect(screen.getByText("Ene 2026 · ARS")).toBeInTheDocument();
  });

  it("displays positive amount with $ prefix", () => {
    render(
      <BalanceCard
        title="Balance"
        amount={2500.5}
        subtitle="Ene 2026 · ARS"
        icon={<PlusOutlined />}
        isFetching={false}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("displays negative amount with -$ prefix", () => {
    render(
      <BalanceCard
        title="Gastos"
        amount={-500}
        subtitle="Ene 2026 · ARS"
        icon={<PlusOutlined />}
        isFetching={false}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("-$")).toBeInTheDocument();
  });

  it("shows loading skeleton when isFetching=true", () => {
    const { container } = render(
      <BalanceCard
        title="Ingresos Totales"
        amount={1000}
        subtitle="Ene 2026 · ARS"
        icon={<PlusOutlined />}
        isFetching={true}
      />,
      { wrapper: makeWrapper() },
    );

    // Ant Design Card loading renders skeleton elements
    expect(container.querySelector(".ant-skeleton")).toBeTruthy();
  });
});
