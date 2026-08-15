import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Workspace } from "@/models/UserWorkspace";
import type { AppNotification, AppNotificationEntry } from "@/models/AppNotification";
import { NotificationSeverity } from "@/models/AppNotification";
import type { EventWrapper } from "@/apis/websocket/EventWrapper";
import { EventType } from "@/apis/websocket/EventWrapper";
import { useNotificationSubscription } from "@/apis/websocket/useNotificationSubscription";
import { NOTIFICATIONS_QUERY_KEY } from "@/apis/hooks/useNotifications";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("@/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

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

// ── Fixtures ───────────────────────────────────────────────────────────────

const memberships: Workspace[] = [
  {
    id: 1,
    workspaceId: 10,
    workspaceName: "Familia",
    metadata: { members: ["a@test.com"], role: "ADMIN", joinedAt: "2026-01-01T00:00:00", isDefault: true },
  },
  {
    id: 2,
    workspaceId: 20,
    workspaceName: "Trabajo",
    metadata: { members: ["a@test.com"], role: "FAMILY", joinedAt: "2026-01-01T00:00:00", isDefault: false },
  },
];

function makeNotification(id: string, overrides?: Partial<AppNotification>): AppNotification {
  return {
    id,
    title: "Presupuesto superado",
    message: "Superaste el presupuesto de Comida",
    severity: NotificationSeverity.WARNING,
    createdAt: "2026-08-15T10:00:00",
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useNotificationSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    wsMock = makeWsMock();

    vi.mocked(useWorkspaces).mockReturnValue({
      data: memberships,
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to the notifications topic for each membership on mount", () => {
    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/notifications/${memberships[0].workspaceId}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/notifications/${memberships[1].workspaceId}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when memberships list is empty", () => {
    vi.mocked(useWorkspaces).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from all topics on unmount", () => {
    const { unmount } = renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("prepends a new notification as unread on NOTIFICATION_NEW", () => {
    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const notification = makeNotification("n1");
    const event: EventWrapper<AppNotification> = {
      eventType: EventType.NOTIFICATION_NEW,
      message: notification,
    };

    act(() => {
      wsMock.trigger(`/topic/notifications/${memberships[0].workspaceId}/new`, event);
    });

    const cached = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(cached).toHaveLength(1);
    expect(cached?.[0]).toMatchObject({ ...notification, read: false });
  });

  it("keeps the newest notification first", () => {
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [
      { ...makeNotification("old"), read: true },
    ]);

    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<AppNotification> = {
      eventType: EventType.NOTIFICATION_NEW,
      message: makeNotification("new"),
    };

    act(() => {
      wsMock.trigger(`/topic/notifications/${memberships[0].workspaceId}/new`, event);
    });

    const cached = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(cached?.map((n) => n.id)).toEqual(["new", "old"]);
  });

  it("ignores a duplicate notification id", () => {
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [
      { ...makeNotification("n1"), read: false },
    ]);

    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<AppNotification> = {
      eventType: EventType.NOTIFICATION_NEW,
      message: makeNotification("n1"),
    };

    act(() => {
      wsMock.trigger(`/topic/notifications/${memberships[0].workspaceId}/new`, event);
    });

    const cached = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(cached).toHaveLength(1);
  });

  it("ignores events with an unknown event type", () => {
    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event = {
      eventType: "UNKNOWN_EVENT" as EventWrapper<AppNotification>["eventType"],
      message: makeNotification("n1"),
    };

    act(() => {
      wsMock.trigger(`/topic/notifications/${memberships[0].workspaceId}/new`, event as EventWrapper<AppNotification>);
    });

    const cached = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(cached).toBeUndefined();
  });

  it("caps the notification list at 50 entries", () => {
    const existing: AppNotificationEntry[] = Array.from({ length: 50 }, (_, i) => ({
      ...makeNotification(`n${i}`),
      read: true,
    }));
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, existing);

    renderHook(() => useNotificationSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<AppNotification> = {
      eventType: EventType.NOTIFICATION_NEW,
      message: makeNotification("newest"),
    };

    act(() => {
      wsMock.trigger(`/topic/notifications/${memberships[0].workspaceId}/new`, event);
    });

    const cached = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(cached).toHaveLength(50);
    expect(cached?.[0].id).toBe("newest");
    expect(cached?.some((n) => n.id === "n49")).toBe(false);
  });
});
