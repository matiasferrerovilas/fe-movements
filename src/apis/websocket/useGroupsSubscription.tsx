import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import type { EventWrapper } from "./EventWrapper";
import type { AccountsWithUsersCount } from "../../models/UserGroup";

const USER_GROUPS_QUERY_KEY = ["user-groups"] as const;

export const useGroupsSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();

  const callbackRef =
    useRef<(event: EventWrapper<AccountsWithUsersCount[]>) => void | null>(
      null
    );

  // Inicializamos el callback una sola vez
  if (!callbackRef.current) {
    callbackRef.current = (event) => {
      const payload = event.message;
      queryClient.setQueryData(USER_GROUPS_QUERY_KEY, payload);
    };
  }

  useEffect(() => {
    if (!ws?.isConnected) return;

    const callback = callbackRef.current!;
    const topics = ["/topic/groups/update", "/topic/groups/new"];

    // Suscripción
    topics.forEach((topic) => ws.subscribe(topic, callback));

    // Cleanup seguro
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws?.isConnected, ws]); // Re-suscribe sólo cuando cambia el socket

  return null;
};
