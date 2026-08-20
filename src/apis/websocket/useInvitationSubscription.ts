// useInvitationSubscription.ts
import { useEffect, useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";
import { EventType, type EventWrapper } from "@/apis/websocket/EventWrapper";
import type { Invitations } from "@/models/UserWorkspace";
import { useKeycloak } from "@react-keycloak/web";
import { useCurrentUser } from "@/apis/hooks/useCurrentUser";
import { NOTIFICATIONS_QUERY_KEY } from "@/apis/hooks/useNotifications";
import { NotificationSeverity, type AppNotificationEntry } from "@/models/AppNotification";

const INVITATIONS_ACCOUNT_QUERY_KEY = "workspace-invitations" as const;
const MAX_NOTIFICATIONS = 50;

export const useInvitationSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { keycloak } = useKeycloak();
  const { data: currentUser } = useCurrentUser();
  const userEmail = currentUser?.email;
  const { t } = useTranslation();

  // callbackRef evita stale closures: siempre lee los valores más recientes
  const callbackRef = useRef<((event: EventWrapper<Invitations>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<Invitations>) => {
      const payload = event.message;

      if (payload.invitedByEmail == keycloak.tokenParsed?.preferred_username) {
        return;
      }

      if (event.eventType === EventType.INVITATION_ADDED) {
        const notifId = `invitation-${payload.id}`;
        queryClient.setQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY, (notifs = []) => {
          if (notifs.some((n) => n.id === notifId)) return notifs;

          const entry: AppNotificationEntry = {
            id: notifId,
            title: t("common.notifications.invitationReceivedTitle"),
            message: t("common.notifications.invitationReceivedMessage", {
              invitedByEmail: payload.invitedByEmail,
              workspaceName: payload.workspaceName,
            }),
            severity: NotificationSeverity.INFO,
            createdAt: payload.createdAt,
            read: false,
          };
          return [entry, ...notifs].slice(0, MAX_NOTIFICATIONS);
        });
      }

      const queries = queryClient.getQueriesData<Invitations[]>({
        queryKey: [INVITATIONS_ACCOUNT_QUERY_KEY],
        exact: false,
      });

      queries.forEach(([queryKey, oldData]) => {
        console.debug("📨 Nueva invitación recibida:", event);
        console.debug("📨 Old Data:", oldData);
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
    if (!ws.isConnected || !userEmail) return;

    const callback = (event: EventWrapper<Invitations>) => callbackRef.current!(event);

    // api-movements direcciona estos topics por email (ver WebSocketTopics.invitationsNew), no
    // por userId — es lo único que el evento de api-identity trae sobre el invitado.
    const topics = [
      `/topic/invitations/${userEmail}/new`,
      `/topic/invitations/${userEmail}/update`,
    ];

    // Suscribimos una vez por montaje
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // Cleanup: desuscribimos solo cuando el hook se desmonta o el socket cambia
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, userEmail]); // se re-suscribe si el socket o el email cambia

  return null;
};
