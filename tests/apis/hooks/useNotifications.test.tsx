import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  NOTIFICATIONS_QUERY_KEY,
  useMarkNotificationsRead,
  useNotifications,
} from "@/apis/hooks/useNotifications";
import { NotificationSeverity, type AppNotificationEntry } from "@/models/AppNotification";

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const entry = (id: string, read: boolean): AppNotificationEntry => ({
  id,
  title: "Alquiler impago",
  message: "No se registró el pago del alquiler",
  severity: NotificationSeverity.ERROR,
  createdAt: "2026-08-15T10:00:00",
  read,
});

describe("useNotifications", () => {
  it("starts with an empty list when there is nothing cached", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useNotifications(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("reads notifications already set in the cache", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [entry("n1", false)]);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data?.[0].id).toBe("n1");
  });
});

describe("useMarkNotificationsRead", () => {
  it("marks every cached notification as read", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [entry("n1", false), entry("n2", false)]);

    const { result } = renderHook(() => useMarkNotificationsRead(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current();

    const cached = queryClient.getQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY);
    expect(cached?.every((n) => n.read)).toBe(true);
  });

  it("does nothing when there is no cached data yet", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useMarkNotificationsRead(), {
      wrapper: makeWrapper(queryClient),
    });

    result.current();

    expect(queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY)).toBeUndefined();
  });
});
