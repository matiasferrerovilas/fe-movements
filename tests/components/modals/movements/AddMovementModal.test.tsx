import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Membership } from "../../../../src/models/UserWorkspace";
import type { BankRecord } from "../../../../src/models/Bank";
import type { UserSetting } from "../../../../src/models/UserSetting";
import type { Category } from "../../../../src/models/Category";
import type { Currency } from "../../../../src/apis/currencies/CurrencyApi";
import AddMovementModal from "../../../../src/components/modals/movements/AddMovementModal";

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockMemberships: Membership[] = [
  { workspaceId: 10, membershipId: 1, workspaceName: "Familia", role: "ADMIN" },
];

const mockBanks: BankRecord[] = [
  { id: 1, description: "GALICIA" },
];

const mockCategories: Category[] = [
  { id: 1, description: "Supermercado", isActive: true, isDeletable: false },
];

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso argentino" },
];

const defaultAccountSetting: UserSetting = { key: "DEFAULT_WORKSPACE", value: 10 };
const defaultBankSetting: UserSetting = { key: "DEFAULT_BANK", value: 1 };
const defaultCurrencySetting: UserSetting = { key: "DEFAULT_CURRENCY", value: 1 };

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/workspace/membership", () =>
    HttpResponse.json(mockMemberships),
  ),
  http.get("http://localhost:8080/banks", () =>
    HttpResponse.json(mockBanks),
  ),
  http.get("http://localhost:8080/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.get("http://localhost:8080/currency", () =>
    HttpResponse.json(mockCurrencies),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_WORKSPACE", () =>
    HttpResponse.json(defaultAccountSetting),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_BANK", () =>
    HttpResponse.json(defaultBankSetting),
  ),
  http.get("http://localhost:8080/settings/defaults/DEFAULT_CURRENCY", () =>
    HttpResponse.json(defaultCurrencySetting),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

async function openModal() {
  await userEvent.click(screen.getByRole("button", { name: /movimiento/i }));
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AddMovementModal", () => {
  it("renders the trigger button", () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    expect(screen.getByRole("button", { name: /movimiento/i })).toBeInTheDocument();
  });

  it("opens the modal when the trigger button is clicked", async () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();
    await waitFor(() =>
      expect(screen.getByText("Agregar Movimiento")).toBeInTheDocument(),
    );
  });

  it("shows 'Agregar' button when the 'Manual' tab is active (default)", async () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.find((b) => b.textContent?.trim() === "Agregar")).toBeDefined();
    });
    const allButtons = screen.getAllByRole("button");
    expect(allButtons.find((b) => b.textContent?.trim() === "Importar")).toBeUndefined();
  });

  it("shows 'Importar' button after switching to the 'Importar PDF' tab", async () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    await waitFor(() =>
      expect(screen.getByText("Agregar Movimiento")).toBeInTheDocument(),
    );

    // Switch to "Importar PDF" tab
    await userEvent.click(screen.getByRole("tab", { name: /importar pdf/i }));

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const importarBtn = buttons.find((b) => b.textContent?.trim() === "Importar");
      expect(importarBtn).toBeDefined();
    });
    // "Agregar" button should not be visible
    const allButtons = screen.getAllByRole("button");
    expect(allButtons.find((b) => b.textContent?.trim() === "Agregar")).toBeUndefined();
  });

  it("shows 'Importar' button after switching to the 'Importar Excel/CSV' tab", async () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    await waitFor(() =>
      expect(screen.getByText("Agregar Movimiento")).toBeInTheDocument(),
    );

    // Switch to "Importar Excel/CSV" tab
    await userEvent.click(screen.getByRole("tab", { name: /importar excel\/csv/i }));

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const importarBtn = buttons.find((b) => b.textContent?.trim() === "Importar");
      expect(importarBtn).toBeDefined();
    });
    // "Agregar" button should not be visible
    const allButtons = screen.getAllByRole("button");
    expect(allButtons.find((b) => b.textContent?.trim() === "Agregar")).toBeUndefined();
  });

  it("shows 'Agregar' button after switching back to the 'Manual' tab", async () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    await waitFor(() =>
      expect(screen.getByText("Agregar Movimiento")).toBeInTheDocument(),
    );

    // Switch to Importar PDF, then back to Manual
    await userEvent.click(screen.getByRole("tab", { name: /importar pdf/i }));
    await userEvent.click(screen.getByRole("tab", { name: /manual/i }));

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.find((b) => b.textContent?.trim() === "Agregar")).toBeDefined();
    });
  });

  it("shows correct tabs: Manual, Importar PDF, and Importar Excel/CSV", async () => {
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /manual/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /importar pdf/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /importar excel\/csv/i })).toBeInTheDocument();
    });
  });
});
