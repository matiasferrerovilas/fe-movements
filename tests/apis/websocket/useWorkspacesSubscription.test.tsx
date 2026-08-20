import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Workspace } from "@/models/UserWorkspace";
import type { EventWrapper } from "@/apis/websocket/EventWrapper";
import { EventType } from "@/apis/websocket/EventWrapper";
import { useWorkspacesSubscription } from "@/apis/websocket/useWorkspacesSubscription";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("@/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("@/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { useWorkspaces } from "@/apis/hooks/useWorkspaces";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWsMock() {
  const subscriptions = new Map<string, (event: EventWrapper<unknown>) => void>();

  return {
    isConnected: true,
    subscribe: vi.fn((topic: string, cb: (e: EventWrapper<unknown>) => void) => {
      subscriptions.set(topic, cb);
    }),
    unsubscribe: vi.fn((topic: string) => {
      subscriptions.delete(topic);
    }),
    trigger: (topic: string, event: EventWrapper<unknown>) => {
      subscriptions.get(topic)?.(event);
    },
    subscriptions,
  };
}

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ── Test Data ──────────────────────────────────────────────────────────────

const userEmail = "user@test.com";

const memberships: Workspace[] = [
  {
    id: 1,
    workspaceId: 10,
    workspaceName: "Familia",
    metadata: { members: ["a@test.com", "b@test.com"], role: "ADMIN", joinedAt: "2026-01-01T00:00:00", isDefault: true },
  },
  {
    id: 2,
    workspaceId: 20,
    workspaceName: "Trabajo",
    metadata: { members: ["a@test.com", "b@test.com", "c@test.com"], role: "FAMILY", joinedAt: "2026-01-01T00:00:00", isDefault: false },
  },
];

const groups = memberships;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useWorkspacesSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    wsMock = makeWsMock();

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { email: userEmail },
    } as ReturnType<typeof useCurrentUser>);

    vi.mocked(useWorkspaces).mockReturnValue({
      data: memberships,
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to the membership-removed topic and per-membership members/update topics on mount", () => {
    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    // Static, email-keyed "removed from workspace" topic
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/membership/${userEmail}/remove`,
      expect.any(Function),
    );
    // Per-membership members/update topics
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/workspace/${memberships[0].workspaceId}/members/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/workspace/${memberships[1].workspaceId}/members/update`,
      expect.any(Function),
    );
    // 1 static + 2 members/update = 3 total
    expect(wsMock.subscribe).toHaveBeenCalledTimes(3);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when the current user's email is absent", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useCurrentUser>);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from all topics on unmount", () => {
    const { unmount } = renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(3);
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/membership/${userEmail}/remove`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/workspace/${memberships[0].workspaceId}/members/update`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/workspace/${memberships[1].workspaceId}/members/update`,
      expect.any(Function),
    );
  });

  it("invalidates user-workspaces queries on WORKSPACE_LEFT", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<unknown> = {
      eventType: EventType.WORKSPACE_LEFT,
      message: {},
    };

    act(() => {
      wsMock.trigger(`/topic/membership/${userEmail}/remove`, event);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
  });

  it("invalidates user-workspaces queries on MEMBERSHIP_UPDATED via members/update topic", () => {
    queryClient.setQueryData(["user-workspaces"], groups);
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    // El payload real es el evento de invitación aceptada, no un Workspace completo — el hook
    // no intenta mergearlo, solo invalida para refetchear la lista con los miembros al día.
    const event: EventWrapper<unknown> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: { workspaceId: 10, acceptedByEmail: "new@test.com" },
    };

    act(() => {
      wsMock.trigger(`/topic/workspace/${memberships[0].workspaceId}/members/update`, event);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
  });

  it("does not subscribe to members/update topics when memberships list is empty", () => {
    vi.mocked(useWorkspaces).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    // Only the static membership-removed topic, no members/update topics
    expect(wsMock.subscribe).toHaveBeenCalledTimes(1);
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/membership/${userEmail}/remove`,
      expect.any(Function),
    );
  });
});
