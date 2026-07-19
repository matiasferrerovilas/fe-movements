import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Workspace } from "@/models/UserWorkspace";
import type { EventWrapper } from "@/apis/websocket/EventWrapper";
import { EventType } from "@/apis/websocket/EventWrapper";
import { useWorkspacesSubscription } from "@/apis/websocket/useWorkspacesSubscription";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("@/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("@/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
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

const keycloakSubject = "kc-uuid-123";

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

    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: {
        authenticated: true,
        subject: keycloakSubject,
      } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    vi.mocked(useWorkspaces).mockReturnValue({
      data: memberships,
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to default topic, per-membership leave and members/update topics on mount", () => {
    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    // Static default topic
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/account/default/${keycloakSubject}`,
      expect.any(Function),
    );
    // Per-membership leave topics
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[0].workspaceId}/leave`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[1].workspaceId}/leave`,
      expect.any(Function),
    );
    // Per-membership members/update topics
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[0].workspaceId}/members/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[1].workspaceId}/members/update`,
      expect.any(Function),
    );
    // 1 static + 2 leave + 2 members/update = 5 total
    expect(wsMock.subscribe).toHaveBeenCalledTimes(5);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when keycloakUserId is absent", () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: {
        authenticated: true,
        subject: undefined,
      } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

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

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(5);
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/account/default/${keycloakSubject}`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[0].workspaceId}/leave`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[1].workspaceId}/leave`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[0].workspaceId}/members/update`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/account/${memberships[1].workspaceId}/members/update`,
      expect.any(Function),
    );
  });

  it("invalidates user-workspaces queries on ACCOUNT_LEFT", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<unknown> = {
      eventType: EventType.ACCOUNT_LEFT,
      message: {},
    };

    act(() => {
      wsMock.trigger(`/topic/account/${memberships[0].workspaceId}/leave`, event);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
  });

  it("updates an existing group in cache on MEMBERSHIP_UPDATED", () => {
    queryClient.setQueryData(["user-workspaces"], groups);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const updatedGroup: Workspace = {
      id: 2,
      workspaceId: 20,
      workspaceName: "Trabajo",
      metadata: { members: ["a@test.com", "b@test.com", "c@test.com", "d@test.com"], role: "FAMILY", joinedAt: "2026-01-01T00:00:00", isDefault: true },
    };
    const event: EventWrapper<Workspace> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: updatedGroup,
    };

    act(() => {
      wsMock.trigger(`/topic/account/default/${keycloakSubject}`, event);
    });

    const cached = queryClient.getQueryData<Workspace[]>(["user-workspaces"]);
    expect(cached?.find((g) => g.workspaceId === 20)).toMatchObject({
      metadata: expect.objectContaining({ isDefault: true }),
    });
    // el grupo anterior deja de ser default
    expect(cached?.find((g) => g.workspaceId === 10)).toMatchObject({
      metadata: expect.objectContaining({ isDefault: false }),
    });
  });

  it("adds a new group to cache on MEMBERSHIP_UPDATED when it does not exist", () => {
    queryClient.setQueryData(["user-workspaces"], groups);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newGroup: Workspace = {
      id: 3,
      workspaceId: 30,
      workspaceName: "Amigos",
      metadata: { members: ["a@test.com"], role: "GUEST", joinedAt: "2026-01-01T00:00:00", isDefault: false },
    };
    const event: EventWrapper<Workspace> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: newGroup,
    };

    act(() => {
      wsMock.trigger(`/topic/account/default/${keycloakSubject}`, event);
    });

    const cached = queryClient.getQueryData<Workspace[]>(["user-workspaces"]);
    expect(cached).toHaveLength(3);
    expect(cached?.find((g) => g.workspaceId === 30)).toMatchObject(newGroup);
  });

  it("initializes cache with new group when cache is empty on MEMBERSHIP_UPDATED", () => {
    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newGroup: Workspace = {
      id: 1,
      workspaceId: 10,
      workspaceName: "Familia",
      metadata: { members: ["a@test.com"], role: "ADMIN", joinedAt: "2026-01-01T00:00:00", isDefault: true },
    };
    const event: EventWrapper<Workspace> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: newGroup,
    };

    act(() => {
      wsMock.trigger(`/topic/account/default/${keycloakSubject}`, event);
    });

    const cached = queryClient.getQueryData<Workspace[]>(["user-workspaces"]);
    expect(cached).toEqual([newGroup]);
  });

  it("handles MEMBERSHIP_UPDATED via members/update topic", () => {
    queryClient.setQueryData(["user-workspaces"], groups);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const updatedGroup: Workspace = {
      id: 1,
      workspaceId: 10,
      workspaceName: "Familia",
      metadata: { members: ["a@test.com", "b@test.com", "c@test.com", "d@test.com", "e@test.com"], role: "ADMIN", joinedAt: "2026-01-01T00:00:00", isDefault: true },
    };
    const event: EventWrapper<Workspace> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: updatedGroup,
    };

    act(() => {
      wsMock.trigger(
        `/topic/account/${memberships[0].workspaceId}/members/update`,
        event,
      );
    });

    const cached = queryClient.getQueryData<Workspace[]>(["user-workspaces"]);
    expect(cached?.find((g) => g.workspaceId === 10)).toMatchObject({
      metadata: expect.objectContaining({ members: expect.arrayContaining(["e@test.com"]) }),
    });
  });

  it("subscribes only to default topic when memberships list is empty", () => {
    vi.mocked(useWorkspaces).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    // Only 1 static topic, no leave nor members/update topics
    expect(wsMock.subscribe).toHaveBeenCalledTimes(1);
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/account/default/${keycloakSubject}`,
      expect.any(Function),
    );
  });
});
