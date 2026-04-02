import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { GroupDetail } from "../../models/UserGroup";
import { useKeycloak } from "@react-keycloak/web";
import { useGroups } from "../hooks/useGroups";

const USER_GROUPS_QUERY_KEY = ["user-groups-count"] as const;

export const useGroupsSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const keycloakUserId = keycloak.subject;
  const { data: memberships = [] } = useGroups();

  const leaveTopics = useMemo(
    () => memberships.map((m) => `/topic/account/${m.accountId}/leave`),
    [memberships],
  );

  const membersUpdateTopics = useMemo(
    () => memberships.map((m) => `/topic/account/${m.accountId}/members/update`),
    [memberships],
  );

  const callbackRef = useRef<((event: EventWrapper<unknown>) => void) | null>(null);
  if (!callbackRef.current) {
    callbackRef.current = (event: EventWrapper<unknown>) => {
      switch (event.eventType) {
        case EventType.ACCOUNT_LEFT: {
          queryClient.invalidateQueries({ queryKey: ["user-groups"] });
          queryClient.invalidateQueries({ queryKey: USER_GROUPS_QUERY_KEY });
          break;
        }
        case EventType.MEMBERSHIP_UPDATED: {
          const updated = event.message as GroupDetail;
          queryClient.setQueryData(
            USER_GROUPS_QUERY_KEY,
            (old?: GroupDetail[]) => {
              if (!old) return [updated];
              const base = old.map((g) => ({ ...g, isDefault: false }));
              const exists = base.some((g) => g.id === updated.id);
              return exists
                ? base.map((g) => (g.id === updated.id ? updated : g))
                : [...base, updated];
            },
          );
          break;
        }
        default:
          console.warn("⚠️ Evento desconocido:", event.eventType);
      }
    };
  }

  useEffect(() => {
    if (!ws?.isConnected || !keycloakUserId) return;

    const callback = callbackRef.current!;

    const topics = [
      `/topic/account/default/${keycloakUserId}`,
      ...leaveTopics,
      ...membersUpdateTopics,
    ];

    topics.forEach((t) => ws.subscribe(t, callback));
    return () => topics.forEach((t) => ws.unsubscribe(t, callback));
  }, [ws, ws?.isConnected, keycloakUserId, leaveTopics, membersUpdateTopics]);

  return null;
};
