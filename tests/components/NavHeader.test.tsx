import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ThemeContext } from "../../src/apis/theme/ThemeContext";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: vi.fn(),
  useRouterState: vi.fn(),
}));

vi.mock("../../src/apis/hooks/useUserRole", () => ({
  useUserRoles: vi.fn(),
}));

vi.mock("../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useRouter, useRouterState } from "@tanstack/react-router";
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

  vi.mocked(useRouterState).mockReturnValue("/balance" as unknown as ReturnType<typeof useRouterState>);

  vi.mocked(useUserRoles).mockReturnValue({
    hasAnyRole: () => true,
    roles: [],
  } as unknown as ReturnType<typeof useUserRoles>);
}

function makeWrapper(isDark: boolean, toggleTheme = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <ConfigProvider>{children}</ConfigProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
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
    it("muestra el avatar del usuario", () => {
      renderNavHeader(false);
      // El avatar debería estar presente
      expect(document.querySelector(".ant-avatar")).toBeInTheDocument();
    });
  });

  describe("dropdown del usuario", () => {
    it("muestra 'Modo oscuro' en el dropdown cuando está en modo light", async () => {
      const user = userEvent.setup();
      renderNavHeader(false);

      // Click en el avatar para abrir el dropdown
      const avatar = document.querySelector(".ant-avatar");
      await user.click(avatar as HTMLElement);

      // Esperar a que aparezca el menú
      await waitFor(() => {
        expect(screen.getByText("Modo oscuro")).toBeInTheDocument();
      });
    });

    it("muestra 'Modo claro' en el dropdown cuando está en modo dark", async () => {
      const user = userEvent.setup();
      renderNavHeader(true);

      // Click en el avatar para abrir el dropdown
      const avatar = document.querySelector(".ant-avatar");
      await user.click(avatar as HTMLElement);

      // Esperar a que aparezca el menú
      await waitFor(() => {
        expect(screen.getByText("Modo claro")).toBeInTheDocument();
      });
    });

    it("llama a toggleTheme al hacer click en 'Modo oscuro'", async () => {
      const toggleTheme = vi.fn();
      const user = userEvent.setup();
      renderNavHeader(false, toggleTheme);

      // Click en el avatar para abrir el dropdown
      const avatar = document.querySelector(".ant-avatar");
      await user.click(avatar as HTMLElement);

      // Esperar y hacer click en "Modo oscuro"
      await waitFor(() => {
        expect(screen.getByText("Modo oscuro")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Modo oscuro"));

      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("llama a toggleTheme al hacer click en 'Modo claro'", async () => {
      const toggleTheme = vi.fn();
      const user = userEvent.setup();
      renderNavHeader(true, toggleTheme);

      // Click en el avatar para abrir el dropdown
      const avatar = document.querySelector(".ant-avatar");
      await user.click(avatar as HTMLElement);

      // Esperar y hacer click en "Modo claro"
      await waitFor(() => {
        expect(screen.getByText("Modo claro")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Modo claro"));

      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("muestra 'Cerrar sesión' en el dropdown", async () => {
      const user = userEvent.setup();
      renderNavHeader(false);

      // Click en el avatar para abrir el dropdown
      const avatar = document.querySelector(".ant-avatar");
      await user.click(avatar as HTMLElement);

      // Esperar a que aparezca el menú
      await waitFor(() => {
        expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
      });
    });
  });
});
