import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../src/apis/auth/protectedRouteGuard", () => ({
  protectedRouteGuard: () => () => undefined,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: ReactNode }) => opts,
}));

vi.mock("../../src/components/settings/SettingAccount", () => ({
  default: () => <div data-testid="setting-account">SettingAccount</div>,
}));

vi.mock("../../src/components/settings/SettingGroups", () => ({
  SettingGroups: () => <div data-testid="setting-groups">SettingGroups</div>,
}));

vi.mock("../../src/components/settings/SettingInviteGroups", () => ({
  SettingInviteGroups: () => (
    <div data-testid="setting-invite-groups">SettingInviteGroups</div>
  ),
}));

vi.mock("../../src/components/settings/SettingBank", () => ({
  SettingBank: () => <div data-testid="setting-bank">SettingBank</div>,
}));

vi.mock("../../src/components/settings/SettingCurrency", () => ({
  SettingCurrency: () => (
    <div data-testid="setting-currency">SettingCurrency</div>
  ),
}));

vi.mock("../../src/components/settings/SettingIngreso", () => ({
  SettingIngreso: () => (
    <div data-testid="setting-ingreso">SettingIngreso</div>
  ),
}));

vi.mock("../../src/components/settings/SettingCategory", () => ({
  SettingCategory: () => (
    <div data-testid="setting-category">SettingCategory</div>
  ),
}));

// ── Import después de mocks ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { Route } = await import("../../src/routes/settings");
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
    expect(screen.getByText("Grupos")).toBeInTheDocument();
    expect(screen.getByText("Mis finanzas")).toBeInTheDocument();
    expect(screen.getByText("Categorías")).toBeInTheDocument();
  });

  it("no renderiza la tab 'Preferencias' (eliminada)", () => {
    renderSettings();

    expect(screen.queryByText("Preferencias")).not.toBeInTheDocument();
  });

  it("la tab activa por defecto es 'Cuenta' y muestra SettingAccount", () => {
    renderSettings();

    expect(screen.getByTestId("setting-account")).toBeInTheDocument();
  });

  it("la tab 'Cuenta' no incluye SettingIngreso", () => {
    renderSettings();

    expect(screen.queryByTestId("setting-ingreso")).not.toBeInTheDocument();
  });

  it("al hacer click en 'Mis finanzas' muestra SettingBank, SettingCurrency y SettingIngreso", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText("Mis finanzas"));

    expect(screen.getByTestId("setting-bank")).toBeInTheDocument();
    expect(screen.getByTestId("setting-currency")).toBeInTheDocument();
    expect(screen.getByTestId("setting-ingreso")).toBeInTheDocument();
  });

  it("al hacer click en 'Grupos' muestra SettingInviteGroups y SettingGroups", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText("Grupos"));

    expect(screen.getByTestId("setting-invite-groups")).toBeInTheDocument();
    expect(screen.getByTestId("setting-groups")).toBeInTheDocument();
  });

  it("al hacer click en 'Categorías' muestra SettingCategory", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByText("Categorías"));

    expect(screen.getByTestId("setting-category")).toBeInTheDocument();
  });
});
