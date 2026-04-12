// useInvitationSubscription.ts
import { useEffect, useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { Invitations } from "../../models/UserWorkspace";
import { useKeycloak } from "@react-keycloak/web";
import { useCurrentUser } from "../hooks/useCurrentUser";

const INVITATIONS_ACCOUNT_QUERY_KEY = "workspace-invitations" as const;

export const useInvitationSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  // callbackRef evita stale closures: siempre lee los valores más recientes
  const callbackRef = useRef<((event: EventWrapper<Invitations>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<Invitations>) => {
      const payload = event.message;

      if (payload.invitedBy == keycloak.tokenParsed?.preferred_username) {
        return;
      }

      const queries = queryClient.getQueriesData<Invitations[]>({
        queryKey: [INVITATIONS_ACCOUNT_QUERY_KEY],
        exact: false,
      });

      queries.forEach(([queryKey, oldData]) => {
        console.log("📨 Nueva invitación recibida:", event);
        console.log("📨 Old Data:", oldData);
        if (!oldData) return;

        queryClient.setQueryData(queryKey, (old?: Invitations[]) => {
          if (!old) return old;

          switch (event.eventType) {
            case EventType.INVITATION_ADDED: {
              const invPayload = event.message as Invitations;
              const exists = old.some((inv) => inv.id === invPayload.id);
              if (exists) return old;

              return [...old, invPayload];
            }
            case EventType.INVITATION_CONFIRMED_REJECTED: {
              queryClient.invalidateQueries({ queryKey: ["user-workspaces"] });
              return old.filter((i) => i.id !== payload.id);
            }
            default:
              console.warn("⚠️ Evento desconocido:", event.eventType);
              return old;
          }
        });
      });
    };
  });

  useEffect(() => {
    if (!ws.isConnected || !userId) return;

    const callback = (event: EventWrapper<Invitations>) => callbackRef.current!(event);

    const topics = [
      `/topic/invitation/${userId}/new`,
      `/topic/invitation/${userId}/update`,
    ];

    // Suscribimos una vez por montaje
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // Cleanup: desuscribimos solo cuando el hook se desmonta o el socket cambia
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, userId]); // se re-suscribe si el socket o el userId cambia

  return null;
};
