// useInvitationSubscription.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { Invitations } from "../../models/UserGroup";
import { useKeycloak } from "@react-keycloak/web";
import { useCurrentUser } from "../hooks/useCurrentUser";

const INVITATIONS_ACCOUNT_QUERY_KEY = "invitations-groups" as const;

export const useInvitationSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  useEffect(() => {
    if (!ws.isConnected || !userId) return;

    const callback = (event: EventWrapper<Invitations>) => {
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

              queryClient.invalidateQueries({ queryKey: ["user-groups"] });
              queryClient.invalidateQueries({ queryKey: ["user-groups-count"] });

              return old.filter((i) => i.id !== payload.id);
            }
            default:
              console.warn("⚠️ Evento desconocido:", event.eventType);
              return old;
          }
        });
      });
    };

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
  }, [ws, ws.isConnected, userId, queryClient, keycloak]); // se re-suscribe si el socket o el userId cambia

  return null;
};
