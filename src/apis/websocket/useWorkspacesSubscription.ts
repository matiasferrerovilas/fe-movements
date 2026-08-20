import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";
import { EventType, type EventWrapper } from "@/apis/websocket/EventWrapper";
import { useWorkspaces } from "@/apis/hooks/useWorkspaces";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";

const USER_WORKSPACES_QUERY_KEY = ["user-workspaces"] as const;

export const useWorkspacesSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useWorkspaces();
  const { data: currentUser } = useCurrentUser();
  const userEmail = currentUser?.email;

  // api-movements publica acá (ver InvitationPublishServiceWebSocket) cuando alguien se suma a
  // un workspace compartido, para que quien lo tenga abierto refresque la lista de miembros en
  // vez de quedarse con datos desactualizados.
  const membersUpdateTopics = useMemo(
    () => memberships.map((m) => `/topic/workspace/${m.workspaceId}/members/update`),
    [memberships],
  );

  // El callback solo usa queryClient (estable), así que se puede inicializar directamente
  const callbackRef = useRef((event: EventWrapper<unknown>) => {
    switch (event.eventType) {
      case EventType.MEMBERSHIP_UPDATED:
      case EventType.WORKSPACE_LEFT: {
        // El payload varía según el topic de origen (quién se sumó / quién fue removido) y no
        // trae el workspace completo, así que refrescamos la lista en vez de mergear a mano.
        queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_QUERY_KEY });
        break;
      }
      default:
        console.warn("⚠️ Evento desconocido:", event.eventType);
    }
  });

  useEffect(() => {
    if (!ws?.isConnected || !userEmail) return;

    const callback = callbackRef.current;

    const topics = [`/topic/membership/${userEmail}/remove`, ...membersUpdateTopics];

    topics.forEach((t) => ws.subscribe(t, callback));
    return () => topics.forEach((t) => ws.unsubscribe(t, callback));
  }, [ws, ws?.isConnected, userEmail, membersUpdateTopics]);

  return null;
};
