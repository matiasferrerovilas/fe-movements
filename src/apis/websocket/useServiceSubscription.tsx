// useServiceSubscription.ts
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { useWorkspaces } from "../hooks/useWorkspaces";
import type { Service } from "../../models/Service";
import { EventType, type EventWrapper } from "./EventWrapper";

const SERVICE_KEY = "service-history" as const;

export const useServiceSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useWorkspaces();

  const topics = useMemo(
    () =>
      memberships.flatMap((m) => [
        `/topic/servicios/${m.workspaceId}/update`,
        `/topic/servicios/${m.workspaceId}/new`,
        `/topic/servicios/${m.workspaceId}/remove`,
      ]),
    [memberships]
  );

  // callbackRef evita stale closures: siempre lee los valores más recientes
  const callbackRef = useRef<((event: EventWrapper<Service>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<Service>) => {
      const { eventType, message: payload } = event;

      queryClient.setQueryData([SERVICE_KEY], (old?: Service[]) => {
        if (!old) return eventType === EventType.SERVICE_DELETED ? [] : [payload];

        switch (eventType) {
          case EventType.SERVICE_DELETED:
            return old.filter((s) => s.id !== payload.id);

          case EventType.SERVICE_UPDATED:
          case EventType.SERVICE_PAID:
            return old.some((s) => s.id === payload.id)
              ? old.map((s) => (s.id === payload.id ? payload : s))
              : [...old, payload];

          default:
            return [...old, payload];
        }
      });
    };
  });

  useEffect(() => {
    if (!ws.isConnected || topics.length === 0) return;

    const callback = (event: EventWrapper<Service>) => callbackRef.current!(event);

    // Suscribimos una vez por montaje
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // Cleanup: desuscribimos solo cuando el hook se desmonta o el socket cambia
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, topics]);

  return null;
};
