import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Workspace } from "@/models/UserWorkspace";
import type { BankRecord } from "@/models/Bank";
import type { UserSetting } from "@/models/UserSetting";
import type { Category } from "@/models/Category";
import type { Currency } from "@/apis/currency/CurrencyApi";
import AddMovementModal from "@/components/modals/movements/AddMovementModal";

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Por defecto no-READ_ONLY, para no tener que tocar el resto de los tests de este archivo —
// solo el describe de más abajo lo pisa con mockReturnValueOnce.
const mockUseCurrentWorkspace = vi.fn(() => ({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: vi.fn(),
  isLoading: false,
}));
vi.mock("@/apis/workspace/WorkspaceContext", () => ({
  useCurrentWorkspace: () => mockUseCurrentWorkspace(),
}));

// ── Fixtures ────────────────────────────────────────────────────────────────

const mockMemberships: Workspace[] = [
  {
    id: 1,
    workspaceId: 10,
    workspaceName: "Familia",
    metadata: { members: ["a@test.com"], role: "ADMIN", joinedAt: "2026-01-01T00:00:00", isDefault: true },
  },
];

const mockBanks: BankRecord[] = [
  { id: 1, description: "GALICIA" },
];

const mockCategories: Category[] = [
  { id: 1, description: "Supermercado", isActive: true, isDeletable: false },
];

const mockCurrencies: Currency[] = [
  { id: 1, symbol: "ARS", description: "Peso argentino", workspaceId: null, isDeletable: false },
];

const defaultAccountSetting: UserSetting = { key: "DEFAULT_WORKSPACE", value: 10 };
const defaultBankSetting: UserSetting = { key: "DEFAULT_BANK", value: 1 };
const defaultCurrencySetting: UserSetting = { key: "DEFAULT_CURRENCY", value: 1 };

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.get("http://localhost:8080/workspace", () =>
    HttpResponse.json(mockMemberships),
  ),
  http.get("http://localhost:8080/banks", () =>
    HttpResponse.json(mockBanks),
  ),
  http.get("http://localhost:8080/categories", () =>
    HttpResponse.json(mockCategories),
  ),
  http.get("http://localhost:8080/workspace/currencies", () =>
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
afterEach(() => {
  server.resetHandlers();
  mockNavigate.mockClear();
});
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

  // PDF_IMPORT_ENABLED = false in AddMovementModal.tsx — la pestaña no se renderiza mientras
  // esté desactivada, así que no hay ningún tab "importar pdf" al que hacer click.
  it.skip("shows 'Importar' button after switching to the 'Importar PDF' tab", async () => {
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

  // Mismo motivo: sin la pestaña "Importar PDF" no hay a qué volver.
  it.skip("shows 'Agregar' button after switching back to the 'Manual' tab", async () => {
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
});

describe("AddMovementModal sin bancos cargados", () => {
  it("muestra el aviso de banco requerido en vez de las tabs", async () => {
    server.use(http.get("http://localhost:8080/banks", () => HttpResponse.json([])));
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    expect(
      await screen.findByText("Necesitás un banco para continuar"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /manual/i })).not.toBeInTheDocument();
    expect(
      screen.queryAllByRole("button").find((b) => b.textContent?.trim() === "Agregar"),
    ).toBeUndefined();
  });

  it("navega a /settings con el tab de finanzas al hacer click en 'Ir a Configuración'", async () => {
    server.use(http.get("http://localhost:8080/banks", () => HttpResponse.json([])));
    const user = userEvent.setup();
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    const ctaBtn = await screen.findByRole("button", { name: /ir a configuración/i });
    await user.click(ctaBtn);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/settings",
      search: { tab: "finanzas" },
    });
  });
});

describe("AddMovementModal sin monedas cargadas", () => {
  it("muestra el aviso de moneda requerida en vez de las tabs", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])),
    );
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    expect(
      await screen.findByText("Necesitás una moneda para continuar"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /manual/i })).not.toBeInTheDocument();
  });

  it("navega a /settings con el tab de finanzas al hacer click en 'Ir a Configuración'", async () => {
    server.use(
      http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])),
    );
    const user = userEvent.setup();
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    const ctaBtn = await screen.findByRole("button", { name: /ir a configuración/i });
    await user.click(ctaBtn);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/settings",
      search: { tab: "finanzas" },
    });
  });

  it("prioriza el aviso de banco cuando faltan banco y moneda", async () => {
    server.use(
      http.get("http://localhost:8080/banks", () => HttpResponse.json([])),
      http.get("http://localhost:8080/workspace/currencies", () => HttpResponse.json([])),
    );
    render(<AddMovementModal />, { wrapper: makeWrapper() });
    await openModal();

    expect(
      await screen.findByText("Necesitás un banco para continuar"),
    ).toBeInTheDocument();
  });
});

describe("AddMovementModal con rol READ_ONLY", () => {
  it("no renderiza ningún trigger para crear un movimiento", () => {
    mockUseCurrentWorkspace.mockReturnValueOnce({
      currentWorkspace: { metadata: { role: "READ_ONLY" } },
      workspaces: [],
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    const { container } = render(<AddMovementModal />, { wrapper: makeWrapper() });

    expect(container).toBeEmptyDOMElement();
  });
});
