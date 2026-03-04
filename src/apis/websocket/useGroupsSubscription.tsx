import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { GroupsWithMembers } from "../../models/UserGroup";
import { useKeycloak } from "@react-keycloak/web";

const USER_GROUPS_QUERY_KEY = ["user-groups-count"] as const;

export const useGroupsSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const keycloakUserId = keycloak.subject;

  const callbackRef = useRef<((event: EventWrapper<unknown>) => void) | null>(
    null,
  );

  if (!callbackRef.current) {
    callbackRef.current = (event: EventWrapper<unknown>) => {
      console.debug("📨 Grupo evento recibido:", event);

      const queries = queryClient.getQueriesData<GroupsWithMembers[]>({
        queryKey: USER_GROUPS_QUERY_KEY,
        exact: false,
      });

      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;

        queryClient.setQueryData(queryKey, (old?: GroupsWithMembers[]) => {
          if (!old) return old;

          switch (event.eventType) {
            case EventType.MEMBERSHIP_UPDATED: {
              const updated = event.message as GroupsWithMembers;
              return old.map((g) => ({
                ...g,
                isDefault: g.id === updated.id,
              }));

              break;
            }
            default:
              console.warn("⚠️ Evento desconocido:", event.eventType);
          }
        });
      });
    };
  }

  useEffect(() => {
    if (!ws?.isConnected || !keycloakUserId) return;

    const callback = callbackRef.current!;
    const topics = [
      "/topic/account/new",
      `/topic/account/default/${keycloakUserId}`,
    ];

    topics.forEach((t) => ws.subscribe(t, callback));
    return () => topics.forEach((t) => ws.unsubscribe(t, callback));
  }, [ws?.isConnected, ws, keycloakUserId]);

  return null;
};
