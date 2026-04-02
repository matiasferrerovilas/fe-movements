import { useQuery } from "@tanstack/react-query";
import { getSubscriptionsApi } from "../SubscriptionApi";

const SERVICE_KEY = ["service-history"] as const;

export const useSubscription = () =>
  useQuery({
    queryKey: SERVICE_KEY,
    queryFn: () => getSubscriptionsApi(),
    staleTime: 5 * 60 * 1000,
  });
