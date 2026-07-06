import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

vi.mock("@/apis/auth/protectedRouteGuard", () => ({
  protectedRouteGuard: () => () => undefined,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: ReactNode }) => opts,
}));

vi.mock("@/components/settings/SettingAccount", () => ({
  default: () => <div data-testid="setting-account">SettingAccount</div>,
}));

vi.mock("@/components/settings/SettingCurrentWorkspace", () => ({
  SettingCurrentWorkspace: () => <div data-testid="setting-current-workspace">SettingCurrentWorkspace</div>,
}));

vi.mock("@/components/settings/SettingInviteWorkspaces", () => ({
  SettingInviteWorkspaces: () => (
    <div data-testid="setting-invite-groups">SettingInviteWorkspaces</div>
  ),
}));

vi.mock("@/components/settings/SettingBank", () => ({
  SettingBank: () => <div data-testid="setting-bank">SettingBank</div>,
}));

vi.mock("@/components/settings/SettingCurrency", () => ({
  SettingCurrency: () => (
    <div data-testid="setting-currency">SettingCurrency</div>
  ),
}));

vi.mock("@/components/settings/SettingIncome", () => ({
  SettingIncome: () => (
    <div data-testid="setting-income">SettingIncome</div>
  ),
}));

vi.mock("@/components/settings/SettingCategory", () => ({
  SettingCategory: () => (
    <div data-testid="setting-category">SettingCategory</div>
  ),
}));

vi.mock("@/components/settings/SettingPreferences", () => ({
  SettingPreferences: () => (
    <div data-testid="setting-preferences">SettingPreferences</div>
  ),
}));

// ── Import después de mocks ────────────────────────────────────────────────

const { Route } = await import("@/routes/settings");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RouteComponent = (Route as any).component as React.FC;

import React from "react";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderSettings() {
  return render(<RouteComponent />, { wrapper: makeWrapper() });
}

// ── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Settings route — estructura de tabs", () => {
  it("renderiza las 4 tabs correctas", () => {
    renderSettings();

    expect(screen.getByText("Cuenta")).toBeInTheDocument();
    expect(screen.getByText("Mi Workspace")).toBeInTheDocument();
    expect(screen.getByText("Mis finanzas")).toBeInTheDocument();
    expect(screen.getByText("Preferencias")).toBeInTheDocument();
  });

  it("la tab activa por defecto es 'Cuenta' y muestra SettingAccount", () => {
    renderSettings();

    expect(screen.getByTestId("setting-account")).toBeInTheDocument();
  });

  it("la tab 'Cuenta' no incluye SettingIncome", () => {
    renderSettings();

    expect(screen.queryByTestId("setting-income")).not.toBeInTheDocument();
  });

  it("al hacer click en 'Mis finanzas' muestra SettingBank, SettingCurrency y SettingIncome", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText("Mis finanzas"));

    expect(screen.getByTestId("setting-bank")).toBeInTheDocument();
    expect(screen.getByTestId("setting-currency")).toBeInTheDocument();
    expect(screen.getByTestId("setting-income")).toBeInTheDocument();
  });

  it("al hacer click en 'Mi Workspace' muestra SettingInviteWorkspaces, SettingCurrentWorkspace y SettingCategory", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText("Mi Workspace"));

    expect(screen.getByTestId("setting-invite-groups")).toBeInTheDocument();
    expect(screen.getByTestId("setting-current-workspace")).toBeInTheDocument();
    expect(screen.getByTestId("setting-category")).toBeInTheDocument();
  });

  it("al hacer click en 'Preferencias' muestra SettingPreferences", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText("Preferencias"));

    expect(screen.getByTestId("setting-preferences")).toBeInTheDocument();
  });
});
