import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Invitations } from "@/models/UserWorkspace";
import type { EventWrapper } from "@/apis/websocket/EventWrapper";
import { EventType } from "@/apis/websocket/EventWrapper";
import { useInvitationSubscription } from "@/apis/websocket/useInvitationSubscription";
import { NOTIFICATIONS_QUERY_KEY } from "@/apis/hooks/useNotifications";
import type { AppNotificationEntry } from "@/models/AppNotification";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("@/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
  CURRENT_USER_QUERY_KEY: ["current-user"],
}));

vi.mock("@/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Captures the callback registered for each topic so we can trigger events */
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

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useInvitationSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  const userEmail = "me@test.com";
  const invitation: Invitations = {
    id: 1,
    workspaceId: 10,
    workspaceName: "Familia",
    invitedByEmail: "other@test.com",
    status: "PENDING",
    createdAt: "2026-07-16T10:00:00",
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    wsMock = makeWsMock();

    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: {
        authenticated: true,
        tokenParsed: { preferred_username: userEmail },
      } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    vi.mocked(useCurrentUser).mockReturnValue({
      data: {
        id: 99,
        email: userEmail,
        givenName: "Test",
        familyName: "User",
        userType: "ADMIN",
        metadata: { isFirstLogin: false, hasSeenTour: true, userRole: ["ROLE_ADMIN"] },
      },
      isSuccess: true,
    } as ReturnType<typeof useCurrentUser>);

    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to the correct invitation topics on mount", () => {
    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/invitations/${userEmail}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/invitations/${userEmail}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when the current user's email is not available", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: undefined,
      isSuccess: false,
    } as ReturnType<typeof useCurrentUser>);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from topics on unmount", () => {
    const { unmount } = renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/invitations/${userEmail}/new`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/invitations/${userEmail}/update`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("does not re-subscribe on re-render (callbackRef pattern: stable subscription)", () => {
    const { rerender } = renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    // Re-render without changing deps — subscribe must not be called again
    rerender();

    expect(wsMock.subscribe).toHaveBeenCalledTimes(2); // only from initial mount
  });

  it("adds a new invitation to the cache on INVITATION_ADDED", () => {
    queryClient.setQueryData(["workspace-invitations"], []);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, event);
    });

    expect(queryClient.getQueryData(["workspace-invitations"])).toEqual([invitation]);
  });

  it("does not add a duplicate invitation on INVITATION_ADDED", () => {
    queryClient.setQueryData(["workspace-invitations"], [invitation]);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, event);
    });

    expect(queryClient.getQueryData<Invitations[]>(["workspace-invitations"])).toHaveLength(1);
  });

  it("pushes a bell notification on INVITATION_ADDED", () => {
    queryClient.setQueryData(["workspace-invitations"], []);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, event);
    });

    const notifications = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(notifications).toHaveLength(1);
    expect(notifications?.[0]).toMatchObject({
      id: `invitation-${invitation.id}`,
      severity: "INFO",
      read: false,
      createdAt: invitation.createdAt,
    });
    expect(notifications?.[0].message).toContain(invitation.invitedByEmail);
    expect(notifications?.[0].message).toContain(invitation.workspaceName);
  });

  it("does not push a duplicate bell notification on repeated INVITATION_ADDED", () => {
    queryClient.setQueryData(["workspace-invitations"], []);
    queryClient.setQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY, [
      {
        id: `invitation-${invitation.id}`,
        title: "already there",
        message: "already there",
        severity: "INFO",
        createdAt: invitation.createdAt,
        read: false,
      },
    ]);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, event);
    });

    expect(
      queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY),
    ).toHaveLength(1);
  });

  it("removes invitation from cache and invalidates user-workspaces on INVITATION_CONFIRMED_REJECTED", () => {
    const inv2: Invitations = {
      id: 2,
      workspaceId: 20,
      workspaceName: "Trabajo",
      invitedByEmail: "boss@test.com",
      status: "PENDING",
      createdAt: "2026-07-16T11:00:00",
    };
    queryClient.setQueryData(["workspace-invitations"], [invitation, inv2]);

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_CONFIRMED_REJECTED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/update`, event);
    });

    const remaining = queryClient.getQueryData<Invitations[]>(["workspace-invitations"]);
    expect(remaining).toEqual([inv2]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
  });

  it("ignores invitation sent by the current user", () => {
    queryClient.setQueryData(["workspace-invitations"], []);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: { ...invitation, invitedByEmail: userEmail },
    };

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, event);
    });

    // Cache should remain empty because the invitation was sent by the current user
    expect(queryClient.getQueryData<Invitations[]>(["workspace-invitations"])).toEqual([]);
    expect(
      queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY),
    ).toBeUndefined();
  });
});
