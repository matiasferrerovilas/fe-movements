import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Workspace } from "@/models/UserWorkspace";
import { SettingCurrentWorkspace } from "@/components/settings/SettingCurrentWorkspace";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

const mockWorkspaces: Workspace[] = [
  {
    id: 101,
    workspaceId: 1,
    workspaceName: "Personal",
    metadata: {
      members: ["usuario1@email.com", "usuario2@email.com"],
      role: "ADMIN",
      joinedAt: "2026-01-01T00:00:00",
      isDefault: true,
    },
  },
  {
    id: 102,
    workspaceId: 2,
    workspaceName: "Familia",
    metadata: {
      members: ["usuario1@email.com", "usuario2@email.com", "usuario3@email.com"],
      role: "FAMILY",
      joinedAt: "2026-01-01T00:00:00",
      isDefault: false,
    },
  },
];

const mockSetCurrentWorkspace = vi.fn();
const mockUseCurrentWorkspace = vi.fn();

vi.mock("@/apis/workspace/WorkspaceContext", () => ({
  useCurrentWorkspace: () => mockUseCurrentWorkspace(),
}));

vi.mock("@/apis/websocket/useWorkspacesSubscription", () => ({
  useWorkspacesSubscription: vi.fn(),
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

function renderComponent() {
  const { wrapper, queryClient } = makeWrapper();
  const result = render(<SettingCurrentWorkspace />, { wrapper });
  return { ...result, queryClient };
}

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
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

describe("SettingCurrentWorkspace", () => {
  describe("render inicial", () => {
    it("muestra el nombre del workspace actual", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Personal")).toBeInTheDocument(),
      );
    });

    it("muestra el contador de miembros", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("2 miembros")).toBeInTheDocument(),
      );
    });

    it("muestra el texto descriptivo", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Gestiona el workspace actual")).toBeInTheDocument(),
      );
    });

    it("muestra la sección de miembros", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Miembros")).toBeInTheDocument(),
      );
    });
  });

  describe("lista de miembros", () => {
    it("muestra los emails de los miembros", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("usuario1@email.com")).toBeInTheDocument(),
      );
      expect(screen.getByText("usuario2@email.com")).toBeInTheDocument();
    });

    it("muestra mensaje vacío cuando no hay miembros", async () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: {
          ...mockWorkspaces[0],
          metadata: { ...mockWorkspaces[0].metadata, members: [] },
        },
        workspaces: mockWorkspaces,
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: false,
      });

      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("No hay miembros en este workspace")).toBeInTheDocument(),
      );
    });
  });

  describe("workspace con varios miembros", () => {
    beforeEach(() => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: mockWorkspaces[1], // Familia
        workspaces: mockWorkspaces,
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: false,
      });
    });

    it("muestra el nombre del workspace Familia", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Familia")).toBeInTheDocument(),
      );
    });

    it("muestra el contador de miembros plural", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("3 miembros")).toBeInTheDocument(),
      );
    });
  });

  describe("botón salir del workspace", () => {
    it("muestra el botón de salir cuando hay más de un workspace", async () => {
      renderComponent();
      await waitFor(() =>
        expect(screen.getByTitle("Salir del grupo")).toBeInTheDocument(),
      );
    });

    it("no muestra el botón de salir cuando solo hay un workspace", async () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: mockWorkspaces[0],
        workspaces: [mockWorkspaces[0]], // Solo un workspace
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: false,
      });

      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("Personal")).toBeInTheDocument(),
      );
      expect(screen.queryByTitle("Salir del grupo")).not.toBeInTheDocument();
    });
  });

  describe("sin workspace seleccionado", () => {
    it("muestra mensaje cuando no hay workspace seleccionado", async () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: null,
        workspaces: [],
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: false,
      });

      renderComponent();
      await waitFor(() =>
        expect(screen.getByText("No hay workspace seleccionado")).toBeInTheDocument(),
      );
    });
  });

  describe("estado de carga", () => {
    it("muestra skeleton de carga mientras se cargan los datos", async () => {
      mockUseCurrentWorkspace.mockReturnValue({
        currentWorkspace: null,
        workspaces: [],
        setCurrentWorkspace: mockSetCurrentWorkspace,
        isLoading: true,
      });

      renderComponent();
      // El Card de Ant Design muestra un skeleton cuando loading=true
      // Verificamos que no hay contenido visible
      expect(screen.queryByText("Personal")).not.toBeInTheDocument();
    });
  });
});
