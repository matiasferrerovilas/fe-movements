import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkspaceProvider } from "../../../src/apis/workspace/WorkspaceProvider";
import { useCurrentWorkspace } from "../../../src/apis/workspace/WorkspaceContext";
import type { Membership } from "../../../src/models/UserWorkspace";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockWorkspaces: Membership[] = [
  { workspaceId: 1, membershipId: 101, workspaceName: "Personal", role: "ADMIN" },
  { workspaceId: 2, membershipId: 102, workspaceName: "Familia", role: "FAMILY" },
  { workspaceId: 3, membershipId: 103, workspaceName: "Trabajo", role: "GUEST" },
];

const mockSetDefaultWorkspace = vi.fn();
const mockUseWorkspaces = vi.fn();
const mockUseUserDefault = vi.fn();

vi.mock("../../../src/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: () => mockUseWorkspaces(),
}));

vi.mock("../../../src/apis/hooks/useSettings", () => ({
  useUserDefault: () => mockUseUserDefault(),
  useSetUserDefault: () => ({
    mutate: mockSetDefaultWorkspace,
  }),
}));

// ── Consumer component ─────────────────────────────────────────────────────

function WorkspaceConsumer() {
  const { currentWorkspace, workspaces, setCurrentWorkspace, isLoading } =
    useCurrentWorkspace();
  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="current-id">{currentWorkspace?.workspaceId ?? "none"}</span>
      <span data-testid="current-name">{currentWorkspace?.workspaceName ?? "none"}</span>
      <span data-testid="workspace-count">{workspaces.length}</span>
      <button onClick={() => setCurrentWorkspace(2)}>switch to 2</button>
      <button onClick={() => setCurrentWorkspace(3)}>switch to 3</button>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <WorkspaceConsumer />
      </WorkspaceProvider>
    </QueryClientProvider>,
  );
}

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Reset mocks to default values
  mockUseWorkspaces.mockReturnValue({
    data: mockWorkspaces,
    isLoading: false,
  });
  mockUseUserDefault.mockReturnValue({
    data: null,
    isLoading: false,
  });
});

afterEach(() => {
  cleanup();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("WorkspaceProvider / useCurrentWorkspace", () => {
  describe("valor inicial", () => {
    it("usa el primer workspace si no hay default guardado", async () => {
      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("ready");
      });
      
      expect(screen.getByTestId("current-id").textContent).toBe("1");
      expect(screen.getByTestId("current-name").textContent).toBe("Personal");
    });

    it("expone la lista completa de workspaces", async () => {
      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("ready");
      });
      
      expect(screen.getByTestId("workspace-count").textContent).toBe("3");
    });

    it("usa el workspace default del backend si existe", async () => {
      mockUseUserDefault.mockReturnValue({
        data: { key: "DEFAULT_WORKSPACE", value: 2 },
        isLoading: false,
      });

      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("current-id").textContent).toBe("2");
      });
      
      expect(screen.getByTestId("current-name").textContent).toBe("Familia");
    });
  });

  describe("setCurrentWorkspace", () => {
    it("cambia el workspace actual al hacer switch", async () => {
      const user = userEvent.setup();
      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("ready");
      });
      
      expect(screen.getByTestId("current-id").textContent).toBe("1");
      
      await user.click(screen.getByRole("button", { name: "switch to 2" }));
      
      expect(screen.getByTestId("current-id").textContent).toBe("2");
      expect(screen.getByTestId("current-name").textContent).toBe("Familia");
    });

    it("persiste el cambio en el backend al cambiar workspace", async () => {
      const user = userEvent.setup();
      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("ready");
      });
      
      await user.click(screen.getByRole("button", { name: "switch to 3" }));
      
      expect(mockSetDefaultWorkspace).toHaveBeenCalledWith({
        key: "DEFAULT_WORKSPACE",
        value: 3,
      });
    });

    it("permite cambiar entre diferentes workspaces", async () => {
      const user = userEvent.setup();
      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("ready");
      });
      
      // Switch to workspace 2
      await user.click(screen.getByRole("button", { name: "switch to 2" }));
      expect(screen.getByTestId("current-id").textContent).toBe("2");
      
      // Switch to workspace 3
      await user.click(screen.getByRole("button", { name: "switch to 3" }));
      expect(screen.getByTestId("current-id").textContent).toBe("3");
      expect(screen.getByTestId("current-name").textContent).toBe("Trabajo");
    });
  });

  describe("estado de carga", () => {
    it("muestra loading mientras se cargan los workspaces", async () => {
      mockUseWorkspaces.mockReturnValue({
        data: [],
        isLoading: true,
      });

      renderWithProviders();
      
      expect(screen.getByTestId("loading").textContent).toBe("loading");
    });

    it("muestra loading mientras se carga el default", async () => {
      mockUseUserDefault.mockReturnValue({
        data: null,
        isLoading: true,
      });

      renderWithProviders();
      
      expect(screen.getByTestId("loading").textContent).toBe("loading");
    });
  });

  describe("sin workspaces", () => {
    it("currentWorkspace es null cuando no hay workspaces", async () => {
      mockUseWorkspaces.mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProviders();
      
      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("ready");
      });
      
      expect(screen.getByTestId("current-id").textContent).toBe("none");
      expect(screen.getByTestId("current-name").textContent).toBe("none");
    });
  });
});
