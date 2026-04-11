import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { WorkspaceDetail, Membership } from "../../../src/models/UserWorkspace";
import type { EventWrapper } from "../../../src/apis/websocket/EventWrapper";
import { EventType } from "../../../src/apis/websocket/EventWrapper";
import { useWorkspacesSubscription } from "../../../src/apis/websocket/useWorkspacesSubscription";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("../../../src/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useWorkspaces } from "../../../src/apis/hooks/useWorkspaces";
import { useWebSocket } from "../../../src/apis/websocket/WebSocketProvider";

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

const memberships: Membership[] = [
  { workspaceId: 10, membershipId: 1, workspaceName: "Familia", role: "ADMIN" },
  { workspaceId: 20, membershipId: 2, workspaceName: "Trabajo", role: "FAMILY" },
];

const groups: WorkspaceDetail[] = [
  { id: 10, name: "Familia", membersCount: 2, isDefault: true },
  { id: 20, name: "Trabajo", membersCount: 3, isDefault: false },
];

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

  it("invalidates user-workspaces and workspace-count queries on ACCOUNT_LEFT", () => {
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
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["workspace-count"] });
  });

  it("updates an existing group in cache on MEMBERSHIP_UPDATED", () => {
    queryClient.setQueryData(["workspace-count"], groups);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const updatedGroup: WorkspaceDetail = {
      id: 20,
      name: "Trabajo",
      membersCount: 4,
      isDefault: true,
    };
    const event: EventWrapper<WorkspaceDetail> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: updatedGroup,
    };

    act(() => {
      wsMock.trigger(`/topic/account/default/${keycloakSubject}`, event);
    });

    const cached = queryClient.getQueryData<WorkspaceDetail[]>(["workspace-count"]);
    expect(cached?.find((g) => g.id === 20)).toMatchObject({
      membersCount: 4,
      isDefault: true,
    });
    // el grupo anterior deja de ser default
    expect(cached?.find((g) => g.id === 10)).toMatchObject({
      membersCount: 2,
      isDefault: false,
    });
  });

  it("adds a new group to cache on MEMBERSHIP_UPDATED when it does not exist", () => {
    queryClient.setQueryData(["workspace-count"], groups);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newGroup: WorkspaceDetail = {
      id: 30,
      name: "Amigos",
      membersCount: 1,
      isDefault: false,
    };
    const event: EventWrapper<WorkspaceDetail> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: newGroup,
    };

    act(() => {
      wsMock.trigger(`/topic/account/default/${keycloakSubject}`, event);
    });

    const cached = queryClient.getQueryData<WorkspaceDetail[]>(["workspace-count"]);
    expect(cached).toHaveLength(3);
    expect(cached?.find((g) => g.id === 30)).toMatchObject(newGroup);
  });

  it("initializes cache with new group when cache is empty on MEMBERSHIP_UPDATED", () => {
    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newGroup: WorkspaceDetail = {
      id: 10,
      name: "Familia",
      membersCount: 1,
      isDefault: true,
    };
    const event: EventWrapper<WorkspaceDetail> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: newGroup,
    };

    act(() => {
      wsMock.trigger(`/topic/account/default/${keycloakSubject}`, event);
    });

    const cached = queryClient.getQueryData<WorkspaceDetail[]>(["workspace-count"]);
    expect(cached).toEqual([newGroup]);
  });

  it("handles MEMBERSHIP_UPDATED via members/update topic", () => {
    queryClient.setQueryData(["workspace-count"], groups);

    renderHook(() => useWorkspacesSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const updatedGroup: WorkspaceDetail = {
      id: 10,
      name: "Familia",
      membersCount: 5,
      isDefault: true,
    };
    const event: EventWrapper<WorkspaceDetail> = {
      eventType: EventType.MEMBERSHIP_UPDATED,
      message: updatedGroup,
    };

    act(() => {
      wsMock.trigger(
        `/topic/account/${memberships[0].workspaceId}/members/update`,
        event,
      );
    });

    const cached = queryClient.getQueryData<WorkspaceDetail[]>(["workspace-count"]);
    expect(cached?.find((g) => g.id === 10)).toMatchObject({ membersCount: 5 });
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
