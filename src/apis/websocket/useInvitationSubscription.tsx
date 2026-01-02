// useMovementSubscription.ts
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { Invitations } from "../../models/UserGroup";
import { useKeycloak } from "@react-keycloak/web";

const INVITATIONS_ACCOUNT_QUERY_KEY = "invitations-groups" as const;

export const useInvitationSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();

  const callbackRef =
    useRef<(event: EventWrapper<Invitations>) => void | null>(null);

  if (!callbackRef.current) {
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
              const payload = event.message as Invitations;
              const exists = old.some((inv) => inv.id === payload.id);
              if (exists) return old;

              return [...old, payload];
            }
            case EventType.INVITATION_CONFIRMED_REJECTED: {
              const payload = event.message;

              return old.filter((i) => i.id !== payload.id);
            }
            default:
              console.warn("⚠️ Evento desconocido:", event.eventType);
              return old;
          }
        });
      });
      //queryClient.setQueryData([INVITATIONS_GROUPS_QUERY_KEY], payload);
    };
  }

  useEffect(() => {
    if (!ws.isConnected) return;

    const callback = callbackRef.current!;
    const topics = ["/topic/invitation/update", "/topic/invitation/new"];

    // ✅ Suscribimos una vez por montaje
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // 🔄 Cleanup: desuscribimos solo cuando el hook se desmonta o el socket cambia
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected]); // se re-suscribe si el socket cambia

  return null;
};
