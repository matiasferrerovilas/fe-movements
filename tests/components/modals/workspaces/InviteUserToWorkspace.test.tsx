import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import type { Workspace } from "@/models/UserWorkspace";
import InviteUserToWorkspace from "@/components/modals/workspaces/InviteUserToWorkspace";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    data: { id: 1, email: "test@test.com", userType: "PERSONAL" },
    isLoading: false,
  }),
}));

// ── MSW server ─────────────────────────────────────────────────────────────

let lastRequestBody: unknown = null;

const server = setupServer(
  http.post("http://localhost:8080/workspace/:id/invitations", async ({ request }) => {
    lastRequestBody = await request.json();
    return HttpResponse.json({}, { status: 200 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  lastRequestBody = null;
});
afterAll(() => server.close());

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const group: Workspace = {
  id: 55,
  workspaceId: 5,
  workspaceName: "Familia",
  metadata: {
    memberDetails: [],
    role: "OWNER",
    joinedAt: "2026-01-01T00:00:00",
    isDefault: false,
  },
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("InviteUserToWorkspace", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // COLLABORATOR is the default so an admin inviting someone without touching the role
  // selector still gets the same behavior as before this feature existed.
  it("defaults the role to COLLABORATOR and sends it to the backend", async () => {
    render(<InviteUserToWorkspace group={group} />, { wrapper: makeWrapper(queryClient) });

    await userEvent.click(screen.getByTitle("Invitar miembro al grupo"));
    await userEvent.type(await screen.findByPlaceholderText("usuario@ejemplo.com"), "nuevo@test.com");
    await userEvent.click(screen.getByText("Enviar invitación"));

    await waitFor(() => {
      expect(lastRequestBody).toEqual({
        emails: ["nuevo@test.com"],
        workspaceId: 5,
        role: "COLLABORATOR",
      });
    });
  });

  it("sends READ_ONLY when the inviter picks it from the role selector", async () => {
    render(<InviteUserToWorkspace group={group} />, { wrapper: makeWrapper(queryClient) });

    await userEvent.click(screen.getByTitle("Invitar miembro al grupo"));
    await userEvent.type(await screen.findByPlaceholderText("usuario@ejemplo.com"), "readonly@test.com");

    await userEvent.click(screen.getByText("Colaborador — puede crear y editar"));
    await userEvent.click(await screen.findByText("Solo lectura — solo puede ver"));

    await userEvent.click(screen.getByText("Enviar invitación"));

    await waitFor(() => {
      expect(lastRequestBody).toEqual({
        emails: ["readonly@test.com"],
        workspaceId: 5,
        role: "READ_ONLY",
      });
    });
  });
});
