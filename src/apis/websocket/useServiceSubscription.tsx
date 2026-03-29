// useMovementSubscription.ts
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { useGroups } from "../hooks/useGroups";
import type { Service } from "../../models/Service";
import type { EventWrapper } from "./EventWrapper";

const SERVICE_KEY = "service-history" as const;

export const useServiceSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useGroups();

  const topics = useMemo(
    () =>
      memberships.flatMap((m) => [
        `/topic/servicios/${m.groupId}/update`,
        `/topic/servicios/${m.groupId}/new`,
        `/topic/servicios/${m.groupId}/remove`,
      ]),
    [memberships]
  );

  const callbackRef =
    useRef<(event: EventWrapper<Service>) => void | null>(null);

  if (!callbackRef.current) {
    callbackRef.current = (event: EventWrapper<Service>) => {
      const { eventType, message: payload } = event;

      queryClient.setQueryData([SERVICE_KEY], (old?: Service[]) => {
        if (!old) return eventType === "SERVICE_DELETED" ? [] : [payload];

        switch (eventType) {
          case "SERVICE_DELETED":
            return old.filter((s) => s.id !== payload.id);

          case "SERVICE_UPDATED":
          case "SERVICE_PAID":
            return old.some((s) => s.id === payload.id)
              ? old.map((s) => (s.id === payload.id ? payload : s))
              : [...old, payload];

          default:
            return [...old, payload];
        }
      });
    };
  }

  useEffect(() => {
    if (!ws.isConnected || topics.length === 0) return;

    const callback = callbackRef.current!;

    // ✅ Suscribimos una vez por montaje
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // 🔄 Cleanup: desuscribimos solo cuando el hook se desmonta o el socket cambia
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, topics]);

  return null;
};
