import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { WorkspaceDetail } from "../../models/UserWorkspace";
import { useKeycloak } from "@react-keycloak/web";
import { useWorkspaces } from "../hooks/useWorkspaces";

const USER_WORKSPACES_COUNT_QUERY_KEY = ["workspace-count"] as const;

export const useWorkspacesSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const keycloakUserId = keycloak.subject;
  const { data: memberships = [] } = useWorkspaces();

  const leaveTopics = useMemo(
    () => memberships.map((m) => `/topic/account/${m.workspaceId}/leave`),
    [memberships],
  );

  const membersUpdateTopics = useMemo(
    () => memberships.map((m) => `/topic/account/${m.workspaceId}/members/update`),
    [memberships],
  );

  const callbackRef = useRef<((event: EventWrapper<unknown>) => void) | null>(null);
  if (!callbackRef.current) {
    callbackRef.current = (event: EventWrapper<unknown>) => {
      switch (event.eventType) {
        case EventType.ACCOUNT_LEFT: {
          queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
          queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_COUNT_QUERY_KEY });
          break;
        }
        case EventType.MEMBERSHIP_UPDATED: {
          const updated = event.message as WorkspaceDetail;
          queryClient.setQueryData(
            USER_WORKSPACES_COUNT_QUERY_KEY,
            (old?: WorkspaceDetail[]) => {
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
