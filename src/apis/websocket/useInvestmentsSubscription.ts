import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/apis/websocket/WebSocketProvider";
import { useWorkspaces } from "@/apis/hooks/useWorkspaces";
import { EventType, type EventWrapper } from "@/apis/websocket/EventWrapper";

const INVESTMENTS_QUERY_KEY = "investments" as const;

export const useInvestmentsSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useWorkspaces();

  const topics = useMemo(
    () => memberships.map((m) => `/topic/investments/${m.workspaceId}/update`),
    [memberships],
  );

  const callbackRef = useRef<((event: EventWrapper<unknown>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<unknown>) => {
      if (event.eventType === EventType.INVESTMENT_UPDATED) {
        void queryClient.invalidateQueries({ queryKey: [INVESTMENTS_QUERY_KEY] });
      }
    };
  });

  useEffect(() => {
    if (!ws.isConnected || topics.length === 0) return;

    const callback = (event: EventWrapper<unknown>) => callbackRef.current!(event);
    topics.forEach((topic) => ws.subscribe(topic, callback));
    return () => {
      topics.forEach((topic) => ws.unsubscribe(topic, callback));
    };
  }, [ws, ws.isConnected, topics]);
};
