import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { WorkspaceDetail } from "../../../../src/models/UserWorkspace";
import ExitWorkspaceModal from "../../../../src/components/modals/workspaces/ExitWorkspaceModal";

// ── MSW server ─────────────────────────────────────────────────────────────

const server = setupServer(
  http.delete("http://localhost:8080/workspace/:id", () =>
    HttpResponse.json({}, { status: 200 }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const group: WorkspaceDetail = { id: 5, name: "Familia", membersCount: 3, isDefault: false };

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ExitWorkspaceModal", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the exit group button", () => {
    render(<ExitWorkspaceModal group={group} />, { wrapper: makeWrapper(queryClient) });
    expect(screen.getByTitle("Salir del grupo")).toBeInTheDocument();
  });

  it("shows confirmation popover when the button is clicked", async () => {
    render(<ExitWorkspaceModal group={group} />, { wrapper: makeWrapper(queryClient) });

    await userEvent.click(screen.getByTitle("Salir del grupo"));

    expect(
      await screen.findByText("¿Estás seguro de que quieres salir del grupo?"),
    ).toBeInTheDocument();
  });

    it("calls DELETE /workspace/{id} when confirmed and invalidates user-groups caches", async () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    render(<ExitWorkspaceModal group={group} />, { wrapper: makeWrapper(queryClient) });

    // Open the popconfirm
    await userEvent.click(screen.getByTitle("Salir del grupo"));

    // Click the confirm button ("Sí")
    await userEvent.click(await screen.findByText("Sí"));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["workspace-count"] });
    });
  });

  it("does not invalidate caches when the mutation request fails", async () => {
    server.use(
      http.delete("http://localhost:8080/workspace/:id", () =>
        HttpResponse.json({ message: "Forbidden" }, { status: 403 }),
      ),
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    render(<ExitWorkspaceModal group={group} />, { wrapper: makeWrapper(queryClient) });

    await userEvent.click(screen.getByTitle("Salir del grupo"));
    await userEvent.click(await screen.findByText("Sí"));

    // Give time for the mutation to settle
    await waitFor(() => {
      // onError is called instead of onSuccess, so invalidateQueries is NOT called
      expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
    });
  });

  it("does not call the API when the user cancels", async () => {
    const deleteSpy = vi.fn(() => HttpResponse.json({}));
    server.use(http.delete("http://localhost:8080/workspace/:id", deleteSpy));

    render(<ExitWorkspaceModal group={group} />, { wrapper: makeWrapper(queryClient) });

    await userEvent.click(screen.getByTitle("Salir del grupo"));
    await userEvent.click(await screen.findByText("No"));

    // The DELETE handler should never have been invoked
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
