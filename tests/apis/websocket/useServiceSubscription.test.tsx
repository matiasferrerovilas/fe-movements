import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Service } from "../../../src/models/Service";
import type { Membership } from "../../../src/models/UserGroup";
import type { EventWrapper } from "../../../src/apis/websocket/EventWrapper";
import { EventType } from "../../../src/apis/websocket/EventWrapper";
import { useServiceSubscription } from "../../../src/apis/websocket/useServiceSubscription";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../../../src/apis/hooks/useGroups", () => ({
  useGroups: vi.fn(),
}));

vi.mock("../../../src/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useGroups } from "../../../src/apis/hooks/useGroups";
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

// ── Fixtures ───────────────────────────────────────────────────────────────

const memberships: Membership[] = [
  { accountId: 10, membershipId: 1, groupDescription: "Familia", role: "ADMIN" },
  { accountId: 20, membershipId: 2, groupDescription: "Trabajo", role: "FAMILY" },
];

function makeService(id: number, overrides?: Partial<Service>): Service {
  return {
    id,
    amount: 10,
    description: `Servicio ${id}`,
    group: "Familia",
    date: "2026-01-01",
    user: "me@test.com",
    currency: null,
    lastPayment: null,
    isPaid: false,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useServiceSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    wsMock = makeWsMock();

    vi.mocked(useGroups).mockReturnValue({
      data: memberships,
      isSuccess: true,
    } as ReturnType<typeof useGroups>);

    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to service topics for each membership on mount", () => {
    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/servicios/${memberships[0].accountId}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/servicios/${memberships[0].accountId}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/servicios/${memberships[0].accountId}/remove`,
      expect.any(Function),
    );
    // 2 memberships × 3 topics = 6
    expect(wsMock.subscribe).toHaveBeenCalledTimes(6);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when memberships list is empty", () => {
    vi.mocked(useGroups).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useGroups>);

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from all topics on unmount", () => {
    const { unmount } = renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(6);
  });

  it("adds a new service to cache on SERVICE_UPDATED when id not present", () => {
    const s1 = makeService(1);
    queryClient.setQueryData(["service-history"], [s1]);

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newService = makeService(2);
    const event: EventWrapper<Service> = {
      eventType: EventType.SERVICE_UPDATED,
      message: newService,
    };

    act(() => {
      wsMock.trigger(`/topic/servicios/${memberships[0].accountId}/update`, event);
    });

    const cached = queryClient.getQueryData<Service[]>(["service-history"]);
    expect(cached).toHaveLength(2);
    expect(cached?.find((s) => s.id === 2)).toMatchObject(newService);
  });

  it("updates existing service in cache on SERVICE_UPDATED", () => {
    const s1 = makeService(1);
    queryClient.setQueryData(["service-history"], [s1]);

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const updated: Service = { ...s1, amount: 999 };
    const event: EventWrapper<Service> = {
      eventType: EventType.SERVICE_UPDATED,
      message: updated,
    };

    act(() => {
      wsMock.trigger(`/topic/servicios/${memberships[0].accountId}/update`, event);
    });

    const cached = queryClient.getQueryData<Service[]>(["service-history"]);
    expect(cached).toHaveLength(1);
    expect(cached?.[0].amount).toBe(999);
  });

  it("updates service as paid on SERVICE_PAID", () => {
    const s1 = makeService(1, { isPaid: false });
    queryClient.setQueryData(["service-history"], [s1]);

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const paid: Service = { ...s1, isPaid: true };
    const event: EventWrapper<Service> = {
      eventType: EventType.SERVICE_PAID,
      message: paid,
    };

    act(() => {
      wsMock.trigger(`/topic/servicios/${memberships[0].accountId}/update`, event);
    });

    const cached = queryClient.getQueryData<Service[]>(["service-history"]);
    expect(cached?.[0].isPaid).toBe(true);
  });

  it("removes service from cache on SERVICE_DELETED", () => {
    const s1 = makeService(1);
    const s2 = makeService(2);
    queryClient.setQueryData(["service-history"], [s1, s2]);

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Service> = {
      eventType: EventType.SERVICE_DELETED,
      message: s1,
    };

    act(() => {
      wsMock.trigger(`/topic/servicios/${memberships[0].accountId}/remove`, event);
    });

    const cached = queryClient.getQueryData<Service[]>(["service-history"]);
    expect(cached).toHaveLength(1);
    expect(cached?.[0].id).toBe(2);
  });

  it("returns empty array on SERVICE_DELETED when cache is empty", () => {
    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<Service> = {
      eventType: EventType.SERVICE_DELETED,
      message: makeService(1),
    };

    act(() => {
      wsMock.trigger(`/topic/servicios/${memberships[0].accountId}/remove`, event);
    });

    const cached = queryClient.getQueryData<Service[]>(["service-history"]);
    expect(cached).toEqual([]);
  });

  it("appends new service to cache when event type is unknown (default case)", () => {
    const s1 = makeService(1);
    queryClient.setQueryData(["service-history"], [s1]);

    renderHook(() => useServiceSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newService = makeService(3);
    // Cast to any to simulate an unknown event type
    const event = {
      eventType: "UNKNOWN_EVENT" as EventWrapper<Service>["eventType"],
      message: newService,
    };

    act(() => {
      wsMock.trigger(`/topic/servicios/${memberships[0].accountId}/new`, event as EventWrapper<Service>);
    });

    const cached = queryClient.getQueryData<Service[]>(["service-history"]);
    expect(cached).toHaveLength(2);
  });
});
