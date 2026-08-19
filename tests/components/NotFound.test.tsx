import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import NotFound from "@/components/NotFound";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ConfigProvider>{children}</ConfigProvider>;
}

describe("NotFound", () => {
  it("muestra el título 404", () => {
    render(<NotFound />, { wrapper });
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("muestra el subtítulo explicativo", () => {
    render(<NotFound />, { wrapper });
    expect(
      screen.getByText("La página que buscás no existe o fue movida."),
    ).toBeInTheDocument();
  });

  it("muestra un link para volver al inicio", () => {
    render(<NotFound />, { wrapper });
    const link = screen.getByRole("link", { name: "Volver al inicio" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
