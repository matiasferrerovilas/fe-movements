// useNotificationSubscription.ts
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";
import { useWorkspaces } from "@/apis/hooks/useWorkspaces";
import { NOTIFICATIONS_QUERY_KEY } from "@/apis/hooks/useNotifications";
import type { AppNotification, AppNotificationEntry } from "@/models/AppNotification";
import { EventType, type EventWrapper } from "@/apis/websocket/EventWrapper";

const MAX_NOTIFICATIONS = 50;

export const useNotificationSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useWorkspaces();

  const topics = useMemo(
    () => memberships.map((m) => `/topic/notifications/${m.workspaceId}/new`),
    [memberships],
  );

  // callbackRef evita stale closures: siempre lee los valores más recientes
  const callbackRef = useRef<((event: EventWrapper<AppNotification>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<AppNotification>) => {
      if (event.eventType !== EventType.NOTIFICATION_NEW) return;

      const entry: AppNotificationEntry = { ...event.message, read: false };

      queryClient.setQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY, (old = []) => {
        if (old.some((n) => n.id === entry.id)) return old;
        return [entry, ...old].slice(0, MAX_NOTIFICATIONS);
      });
    };
  });

  useEffect(() => {
    if (!ws.isConnected || topics.length === 0) return;

    const callback = (event: EventWrapper<AppNotification>) => callbackRef.current!(event);

    topics.forEach((topic) => ws.subscribe(topic, callback));

    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, topics]);

  return null;
};
