import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Movement } from "../../../src/models/Movement";
import type { PageResponse } from "../../../src/models/BaseMode";
import type { Membership } from "../../../src/models/UserGroup";
import type { EventWrapper } from "../../../src/apis/websocket/EventWrapper";
import { EventType } from "../../../src/apis/websocket/EventWrapper";
import { useMovementSubscription } from "../../../src/apis/websocket/useMovementSubscription";

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

function makeMovement(id: number): Movement {
  return {
    id,
    amount: 100,
    description: `Movimiento ${id}`,
    date: "2026-01-01",
    owner: { id: 1, email: "me@test.com", isFirstLogin: false, userType: "ADMIN" },
    bank: "BANCO_X",
    category: null,
    currency: null,
    type: "EXPENSE",
    cuotasTotales: null,
    cuotaActual: null,
    account: { id: 10, name: "Familia" },
  };
}

function makePageResponse(movements: Movement[]): PageResponse<Movement> {
  return {
    content: movements,
    totalElements: movements.length,
    totalPages: 1,
    size: 25,
    number: 0,
    first: true,
    last: true,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useMovementSubscription", () => {
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

  it("subscribes to movement topics for each membership on mount", () => {
    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/movimientos/${memberships[0].accountId}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/movimientos/${memberships[0].accountId}/delete`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/movimientos/${memberships[1].accountId}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/movimientos/${memberships[1].accountId}/delete`,
      expect.any(Function),
    );
    // 2 memberships × 2 topics = 4
    expect(wsMock.subscribe).toHaveBeenCalledTimes(4);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when memberships list is empty", () => {
    vi.mocked(useGroups).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useGroups>);

    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from all topics on unmount", () => {
    const { unmount } = renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(4);
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/movimientos/${memberships[0].accountId}/new`,
      expect.any(Function),
    );
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/movimientos/${memberships[0].accountId}/delete`,
      expect.any(Function),
    );
  });

  it("prepends new movement to first page cache on MOVEMENT_ADDED", () => {
    const existing = makeMovement(1);
    queryClient.setQueryData(
      ["movement-history", 0],
      makePageResponse([existing]),
    );

    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const newMovement = makeMovement(2);
    const event: EventWrapper<Movement> = {
      eventType: EventType.MOVEMENT_ADDED,
      message: newMovement,
    };

    act(() => {
      wsMock.trigger(`/topic/movimientos/${memberships[0].accountId}/new`, event);
    });

    const cached = queryClient.getQueryData<PageResponse<Movement>>(["movement-history", 0]);
    expect(cached?.content[0]).toMatchObject({ id: 2 });
    expect(cached?.totalElements).toBe(2);
  });

  it("updates existing movement in cache on MOVEMENT_ADDED when id matches", () => {
    const existing = makeMovement(1);
    queryClient.setQueryData(
      ["movement-history", 0],
      makePageResponse([existing]),
    );

    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const updated: Movement = { ...existing, amount: 999 };
    const event: EventWrapper<Movement> = {
      eventType: EventType.MOVEMENT_ADDED,
      message: updated,
    };

    act(() => {
      wsMock.trigger(`/topic/movimientos/${memberships[0].accountId}/new`, event);
    });

    const cached = queryClient.getQueryData<PageResponse<Movement>>(["movement-history", 0]);
    expect(cached?.content).toHaveLength(1);
    expect(cached?.content[0].amount).toBe(999);
  });

  it("removes deleted movement from cache on MOVEMENT_DELETED", () => {
    const m1 = makeMovement(1);
    const m2 = makeMovement(2);
    queryClient.setQueryData(
      ["movement-history", 0],
      makePageResponse([m1, m2]),
    );

    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<number> = {
      eventType: EventType.MOVEMENT_DELETED,
      message: 1,
    };

    act(() => {
      wsMock.trigger(`/topic/movimientos/${memberships[0].accountId}/delete`, event);
    });

    const cached = queryClient.getQueryData<PageResponse<Movement>>(["movement-history", 0]);
    expect(cached?.content).toHaveLength(1);
    expect(cached?.content[0].id).toBe(2);
    expect(cached?.totalElements).toBe(1);
  });

  it("does not decrement totalElements when deleted id is not in current page", () => {
    const m1 = makeMovement(1);
    queryClient.setQueryData(
      ["movement-history", 0],
      makePageResponse([m1]),
    );

    renderHook(() => useMovementSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<number> = {
      eventType: EventType.MOVEMENT_DELETED,
      message: 999, // not in cache
    };

    act(() => {
      wsMock.trigger(`/topic/movimientos/${memberships[0].accountId}/delete`, event);
    });

    const cached = queryClient.getQueryData<PageResponse<Movement>>(["movement-history", 0]);
    expect(cached?.totalElements).toBe(1);
  });
});
