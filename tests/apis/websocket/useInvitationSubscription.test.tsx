import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Invitations } from "../../../src/models/UserGroup";
import type { EventWrapper } from "../../../src/apis/websocket/EventWrapper";
import { EventType } from "../../../src/apis/websocket/EventWrapper";
import { useInvitationSubscription } from "../../../src/apis/websocket/useInvitationSubscription";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("../../../src/apis/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
  CURRENT_USER_QUERY_KEY: ["current-user"],
}));

vi.mock("../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useCurrentUser } from "../../../src/apis/hooks/useCurrentUser";
import { useWebSocket } from "../../../src/apis/websocket/WebSocketProvider";

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

  const userId = 99;
  const invitation: Invitations = { id: 1, nameAccount: "Familia", invitedBy: "other@test.com" };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    wsMock = makeWsMock();

    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: {
        authenticated: true,
        tokenParsed: { preferred_username: "me@test.com" },
      } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { id: userId, email: "me@test.com", isFirstLogin: false, userType: "ADMIN" },
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
      `/topic/invitation/${userId}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/invitation/${userId}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when userId is not available", () => {
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
      `/topic/invitation/${userId}/new`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/invitation/${userId}/update`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("adds a new invitation to the cache on INVITATION_ADDED", () => {
    queryClient.setQueryData(["invitations-groups"], []);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitation/${userId}/new`, event);
    });

    expect(queryClient.getQueryData(["invitations-groups"])).toEqual([invitation]);
  });

  it("does not add a duplicate invitation on INVITATION_ADDED", () => {
    queryClient.setQueryData(["invitations-groups"], [invitation]);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitation/${userId}/new`, event);
    });

    expect(queryClient.getQueryData<Invitations[]>(["invitations-groups"])).toHaveLength(1);
  });

  it("removes invitation from cache and invalidates user-groups on INVITATION_CONFIRMED_REJECTED", () => {
    const inv2: Invitations = { id: 2, nameAccount: "Trabajo", invitedBy: "boss@test.com" };
    queryClient.setQueryData(["invitations-groups"], [invitation, inv2]);

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_CONFIRMED_REJECTED,
      message: invitation,
    };

    act(() => {
      wsMock.trigger(`/topic/invitation/${userId}/update`, event);
    });

    const remaining = queryClient.getQueryData<Invitations[]>(["invitations-groups"]);
    expect(remaining).toEqual([inv2]);
  });

  it("ignores invitation sent by the current user", () => {
    queryClient.setQueryData(["invitations-groups"], []);

    // The current user's preferred_username matches invitedBy
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: {
        authenticated: true,
        tokenParsed: { preferred_username: "me@test.com" },
      } as ReturnType<typeof useKeycloak>["keycloak"],
      initialized: true,
    });

    renderHook(() => useInvitationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Invitations> = {
      eventType: EventType.INVITATION_ADDED,
      message: { ...invitation, invitedBy: "me@test.com" },
    };

    act(() => {
      wsMock.trigger(`/topic/invitation/${userId}/new`, event);
    });

    // Cache should remain empty because the invitation was sent by the current user
    expect(queryClient.getQueryData<Invitations[]>(["invitations-groups"])).toEqual([]);
  });
});
