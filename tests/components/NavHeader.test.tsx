import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
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
    it("muestra el toggle de tema en modo light", () => {
      renderNavHeader(false);
      // Segmented renderiza los dos íconos; el activo es el sol
      expect(document.querySelector(".ant-segmented")).toBeInTheDocument();
    });

    it("muestra el toggle de tema en modo dark", () => {
      renderNavHeader(true);
      expect(document.querySelector(".ant-segmented")).toBeInTheDocument();
    });
  });

  describe("toggle de tema", () => {
    it("llama a toggleTheme al hacer click en la opción inactiva (light → dark)", async () => {
      const toggleTheme = vi.fn();
      const user = userEvent.setup();
      renderNavHeader(false, toggleTheme);

      // En modo light el activo es "light"; click en "dark" (MoonOutlined) dispara el toggle
      const options = document.querySelectorAll(".ant-segmented-item");
      // options[1] = dark (luna)
      await user.click(options[1] as HTMLElement);

      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("llama a toggleTheme al hacer click en la opción inactiva (dark → light)", async () => {
      const toggleTheme = vi.fn();
      const user = userEvent.setup();
      renderNavHeader(true, toggleTheme);

      // En modo dark el activo es "dark"; click en "light" (SunOutlined) dispara el toggle
      const options = document.querySelectorAll(".ant-segmented-item");
      // options[0] = light (sol)
      await user.click(options[0] as HTMLElement);

      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
  });
});
