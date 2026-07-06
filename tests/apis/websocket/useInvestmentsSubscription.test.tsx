import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Membership } from "@/models/UserWorkspace";
import type { EventWrapper } from "@/apis/websocket/EventWrapper";
import { EventType } from "@/apis/websocket/EventWrapper";
import { useInvestmentsSubscription } from "@/apis/websocket/useInvestmentsSubscription";

vi.mock("@/apis/hooks/useWorkspaces", () => ({
  useWorkspaces: vi.fn(),
}));

vi.mock("@/apis/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useWorkspaces } from "@/apis/hooks/useWorkspaces";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";

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

const memberships: Membership[] = [
  { workspaceId: 10, membershipId: 1, workspaceName: "Familia", role: "ADMIN" },
  { workspaceId: 20, membershipId: 2, workspaceName: "Trabajo", role: "FAMILY" },
];

describe("useInvestmentsSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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

  it("subscribes to investment topics for each membership on mount", () => {
    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/investments/${memberships[0].workspaceId}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/investments/${memberships[1].workspaceId}/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when websocket is not connected", () => {
    vi.mocked(useWebSocket).mockReturnValue({ ...wsMock, isConnected: false });

    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("does not subscribe when memberships list is empty", () => {
    vi.mocked(useWorkspaces).mockReturnValue({
      data: [],
      isSuccess: true,
    } as ReturnType<typeof useWorkspaces>);

    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes from all topics on unmount", () => {
    const { unmount } = renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    unmount();

    expect(wsMock.unsubscribe).toHaveBeenCalledTimes(2);
    expect(wsMock.unsubscribe).toHaveBeenCalledWith(
      `/topic/investments/${memberships[0].workspaceId}/update`,
      expect.any(Function),
    );
  });

  it("invalidates investments query on INVESTMENT_UPDATED", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderHook(() => useInvestmentsSubscription(), {
      wrapper: makeWrapper(queryClient),
    });

    const event: EventWrapper<unknown> = {
      eventType: EventType.INVESTMENT_UPDATED,
      message: {},
    };

    act(() => {
      wsMock.trigger(`/topic/investments/${memberships[0].workspaceId}/update`, event);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["investments"] });
  });
});
