import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppNotificationEntry } from "@/models/AppNotification";

export const NOTIFICATIONS_QUERY_KEY = ["app-notifications"] as const;

export const useNotifications = () =>
  useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => [] as AppNotificationEntry[],
    initialData: [] as AppNotificationEntry[],
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();

  return () =>
    queryClient.setQueryData<AppNotificationEntry[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
      old ? old.map((n) => ({ ...n, read: true })) : old,
    );
};
