import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { GroupsWithMembers } from "../../models/UserGroup";
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

  useEffect(() => {
    if (!ws?.isConnected || !keycloakUserId) return;

    const callback = (event: EventWrapper<unknown>) => {
      console.debug("📨 Grupo evento recibido:", event);

      switch (event.eventType) {
        case EventType.ACCOUNT_LEFT: {
          queryClient.invalidateQueries({ queryKey: ["user-groups"] });
          queryClient.invalidateQueries({ queryKey: USER_GROUPS_QUERY_KEY });
          break;
        }
        case EventType.MEMBERSHIP_UPDATED: {
          const queries = queryClient.getQueriesData<GroupsWithMembers[]>({
            queryKey: USER_GROUPS_QUERY_KEY,
            exact: false,
          });

          queries.forEach(([queryKey, oldData]) => {
            if (!oldData) return;

            queryClient.setQueryData(queryKey, (old?: GroupsWithMembers[]) => {
              if (!old) return old;
              const updated = event.message as GroupsWithMembers;
              return old.map((g) => ({
                ...g,
                isDefault: g.id === updated.id,
              }));
            });
          });
          break;
        }
        default:
          console.warn("⚠️ Evento desconocido:", event.eventType);
      }
    };

    const staticTopics = [
      "/topic/account/new",
      `/topic/account/default/${keycloakUserId}`,
    ];
    const topics = [...staticTopics, ...leaveTopics];

    topics.forEach((t) => ws.subscribe(t, callback));
    return () => topics.forEach((t) => ws.unsubscribe(t, callback));
  }, [ws?.isConnected, ws, keycloakUserId, leaveTopics, queryClient]);

  return null;
};
