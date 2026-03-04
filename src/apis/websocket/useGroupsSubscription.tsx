import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import type { EventWrapper } from "./EventWrapper";
import type { GroupsWithMembers } from "../../models/UserGroup";
import { useKeycloak } from "@react-keycloak/web";

const USER_GROUPS_QUERY_KEY = ["user-groups"] as const;

export const useGroupsSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const keycloakUserId = keycloak.subject;
  const callbackRef =
    useRef<(event: EventWrapper<GroupsWithMembers[]>) => void | null>(null);

  // Inicializamos el callback una sola vez
  if (!callbackRef.current) {
    callbackRef.current = (event) => {
      console.info("📨 Nuevo movimiento recibido:", event);
      const payload = event.message;
      queryClient.setQueryData(USER_GROUPS_QUERY_KEY, payload);
    };
  }

  useEffect(() => {
    if (!ws?.isConnected) return;

    const callback = callbackRef.current!;
    const topics = [
      "/topic/account/update",
      "/topic/account/new",
      `/topic/account/default/${keycloakUserId}`,
    ];

    // Suscripción
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // Cleanup seguro
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws?.isConnected, ws]); // Re-suscribe sólo cuando cambia el socket

  return null;
};
