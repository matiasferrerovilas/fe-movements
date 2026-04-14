import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import WorkspaceSelector from "../../src/components/WorkspaceSelector";
import type { Membership } from "../../src/models/UserWorkspace";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockWorkspaces: Membership[] = [
  { workspaceId: 1, membershipId: 101, workspaceName: "Personal", role: "ADMIN" },
  { workspaceId: 2, membershipId: 102, workspaceName: "Familia", role: "FAMILY" },
  { workspaceId: 3, membershipId: 103, workspaceName: "Trabajo", role: "GUEST" },
];

const mockSetCurrentWorkspace = vi.fn();
const mockUseCurrentWorkspace = vi.fn();

vi.mock("../../src/apis/workspace/WorkspaceContext", () => ({
  useCurrentWorkspace: () => mockUseCurrentWorkspace(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

function renderComponent(compact = false) {
  const { wrapper, queryClient } = makeWrapper();
  const result = render(<WorkspaceSelector compact={compact} />, { wrapper });
  return { ...result, queryClient };
}

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Default mock values
  mockUseCurrentWorkspace.mockReturnValue({
    currentWorkspace: mockWorkspaces[0],
    workspaces: mockWorkspaces,
    setCurrentWorkspace: mockSetCurrentWorkspace,
    isLoading: false,
  });
});

afterEach(() => {
  cleanup();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("WorkspaceSelector", () => {
  describe("visibilidad", () => {
    it("renderiza el selector cuando hay al menos un workspace", () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: mockWorkspaces[0],
        workspaces: [mockWorkspaces[0]],
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: false,
      });

      renderComponent();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("no renderiza nada mientras isLoading es true", () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: null,
        workspaces: [],
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: true,
      });

      const { container } = renderComponent();
      expect(container.firstChild).toBeNull();
    });

    it("no renderiza nada si workspaces está vacío", () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: null,
        workspaces: [],
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: false,
      });

      const { container } = renderComponent();
      expect(container.firstChild).toBeNull();
    });

    it("renderiza el selector cuando hay múltiples workspaces", () => {
      renderComponent();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("modo normal (desktop)", () => {
    it("muestra el workspace actual seleccionado", () => {
      renderComponent();
      
      // El Select de Ant Design muestra el label del option seleccionado
      expect(screen.getByTitle("Personal")).toBeInTheDocument();
    });

    it("llama a setCurrentWorkspace al seleccionar otro workspace", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Abrir el dropdown
      await user.click(screen.getByRole("combobox"));
      
      // Seleccionar "Familia"
      await user.click(screen.getByText("Familia"));
      
      expect(mockSetCurrentWorkspace).toHaveBeenCalledWith(2);
    });

    it("muestra la opción 'Crear workspace' en el dropdown", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Abrir el dropdown
      await user.click(screen.getByRole("combobox"));
      
      // Verificar que aparece la opción de crear
      expect(screen.getByText("Crear workspace")).toBeInTheDocument();
    });
  });

  describe("modo compact (mobile)", () => {
    it("muestra el label 'Workspace activo' en modo compact", () => {
      renderComponent(true);
      expect(screen.getByText("Workspace activo")).toBeInTheDocument();
    });

    it("muestra el selector en modo compact", () => {
      renderComponent(true);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("llama a setCurrentWorkspace al seleccionar en modo compact", async () => {
      const user = userEvent.setup();
      renderComponent(true);
      
      // Abrir el dropdown
      await user.click(screen.getByRole("combobox"));
      
      // Seleccionar "Trabajo"
      await user.click(screen.getByText("Trabajo"));
      
      expect(mockSetCurrentWorkspace).toHaveBeenCalledWith(3);
    });

    it("muestra la opción 'Crear workspace' en el dropdown en modo compact", async () => {
      const user = userEvent.setup();
      renderComponent(true);
      
      // Abrir el dropdown
      await user.click(screen.getByRole("combobox"));
      
      // Verificar que aparece la opción de crear
      expect(screen.getByText("Crear workspace")).toBeInTheDocument();
    });
  });

  describe("crear workspace", () => {
    it("abre el modal al hacer click en 'Crear workspace'", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      // Abrir el dropdown
      await user.click(screen.getByRole("combobox"));
      
      // Click en crear workspace
      await user.click(screen.getByText("Crear workspace"));
      
      // Verificar que se abre el modal
      expect(screen.getByText("Crear nuevo workspace")).toBeInTheDocument();
    });
  });
});
