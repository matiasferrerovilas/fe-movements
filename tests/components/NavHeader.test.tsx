import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { ThemeContext } from "../../src/apis/theme/ThemeContext";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../../src/apis/hooks/useUserRole", () => ({
  useUserRoles: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useRouter } from "@tanstack/react-router";
import { useUserRoles } from "../../src/apis/hooks/useUserRole";

// ── Setup helpers ──────────────────────────────────────────────────────────

function mockDefaults() {
  vi.mocked(useKeycloak).mockReturnValue({
    keycloak: {
      tokenParsed: {
        preferred_username: "testuser",
        email: "test@test.com",
      },
      logout: vi.fn(),
    },
    initialized: true,
  } as ReturnType<typeof useKeycloak>);

  vi.mocked(useRouter).mockReturnValue({
    state: { location: { pathname: "/balance" } },
    navigate: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);

  vi.mocked(useUserRoles).mockReturnValue({
    hasAnyRole: () => true,
    roles: [],
  } as unknown as ReturnType<typeof useUserRoles>);
}

function makeWrapper(isDark: boolean, toggleTheme = vi.fn()) {
  return ({ children }: { children: ReactNode }) => (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}

// Lazy import after mock setup
const { default: NavHeader } = await import(
  "../../src/components/NavHeader"
);

function renderNavHeader(isDark = false, toggleTheme = vi.fn()) {
  return render(<NavHeader />, { wrapper: makeWrapper(isDark, toggleTheme) });
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockDefaults();
  localStorage.clear();
  document.body.removeAttribute("data-theme");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("NavHeader", () => {
  describe("render inicial", () => {
    it("muestra el ícono de luna (modo oscuro) cuando está en modo light", () => {
      renderNavHeader(false);
      // MoonOutlined tiene role="img" o es un span con aria
      const moonBtn = screen.getByRole("button", {
        name: /cambiar a modo oscuro/i,
      });
      expect(moonBtn).toBeInTheDocument();
    });

    it("muestra el ícono de sol (modo claro) cuando está en modo dark", () => {
      renderNavHeader(true);
      const sunBtn = screen.getByRole("button", {
        name: /cambiar a modo claro/i,
      });
      expect(sunBtn).toBeInTheDocument();
    });
  });

  describe("toggle de tema", () => {
    it("llama a toggleTheme al hacer click en el botón del header", async () => {
      const toggleTheme = vi.fn();
      const user = userEvent.setup();
      renderNavHeader(false, toggleTheme);

      const btn = screen.getByRole("button", { name: /cambiar a modo oscuro/i });
      await user.click(btn);

      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("llama a toggleTheme al hacer click cuando está en dark mode", async () => {
      const toggleTheme = vi.fn();
      const user = userEvent.setup();
      renderNavHeader(true, toggleTheme);

      const btn = screen.getByRole("button", { name: /cambiar a modo claro/i });
      await user.click(btn);

      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
  });
});
