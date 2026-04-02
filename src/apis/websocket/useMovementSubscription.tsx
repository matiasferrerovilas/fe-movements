// useMovementSubscription.ts
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { useGroups } from "../hooks/useGroups";
import type { Movement } from "../../models/Movement";
import type { PageResponse } from "../../models/BaseMode";
import { EventType, type EventWrapper } from "./EventWrapper";

const EXPENSES_QUERY_KEY = "movement-history" as const;
const DEFAULT_PAGE_SIZE = 25;

export const useMovementSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useGroups();

  const topics = useMemo(
    () =>
      memberships.flatMap((m) => [
        `/topic/movimientos/${m.accountId}/new`,
        `/topic/movimientos/${m.accountId}/delete`,
      ]),
    [memberships]
  );

  // callbackRef evita stale closures: siempre lee los valores más recientes
  const callbackRef = useRef<((event: EventWrapper<Movement | number>) => void) | null>(null);
  callbackRef.current = (event: EventWrapper<Movement | number>) => {
    console.debug("📨 Nuevo movimiento recibido:", event);

    const queries = queryClient.getQueriesData<PageResponse<Movement>>({
      queryKey: [EXPENSES_QUERY_KEY],
      exact: false,
    });
    queries.forEach(([queryKey, oldData]) => {
      if (!oldData) return;

      queryClient.setQueryData(queryKey, (old?: PageResponse<Movement>) => {
        if (!old) return old;
        let content = [...old.content];
        let totalElements = old.totalElements;

        switch (event.eventType) {
          case EventType.MOVEMENT_ADDED: {
            const payload = event.message as Movement;
            const existingIndex = old.content.findIndex(
              (s) => s.id === payload.id
            );
            if (existingIndex !== -1) {
              content = [
                ...old.content.slice(0, existingIndex),
                payload,
                ...old.content.slice(existingIndex + 1),
              ];
            } else {
              const isFirstPage =
                Array.isArray(queryKey) && queryKey[1] === 0;

              if (isFirstPage) {
                content = [payload, ...old.content].slice(
                  0,
                  DEFAULT_PAGE_SIZE
                );
                totalElements = old.totalElements + 1;
              } else {
                content = old.content;
                totalElements = old.totalElements + 1;
              }
            }
            break;
          }
          case EventType.MOVEMENT_DELETED: {
            const deletedId = event.message as number;
            const newContent = content.filter((s) => s.id !== deletedId);

            if (newContent.length !== content.length) {
              totalElements -= 1;
            }

            content = newContent;
            break;
          }

          default:
            console.warn("⚠️ Evento desconocido:", event.eventType);
        }

        return {
          ...old,
          content,
          totalElements,
          totalPages: Math.ceil(totalElements / DEFAULT_PAGE_SIZE),
        };
      });
    });
  };

  useEffect(() => {
    if (!ws.isConnected || topics.length === 0) return;

    const callback = (event: EventWrapper<Movement | number>) => callbackRef.current!(event);

    // ✅ Suscribimos una vez por montaje
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // 🔄 Cleanup: desuscribimos solo cuando el hook se desmonta o el socket cambia
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, topics]);
};
