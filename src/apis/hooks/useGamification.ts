import { useQuery } from "@tanstack/react-query";
import { getBadgesApi, getStreakApi } from "@/apis/GamificationApi";

export const STREAK_QUERY_KEY = "streak" as const;
export const BADGES_QUERY_KEY = "badges" as const;

export const useStreak = () =>
  useQuery({
    queryKey: [STREAK_QUERY_KEY],
    queryFn: getStreakApi,
    staleTime: 1000 * 30,
  });

export const useBadges = () =>
  useQuery({
    queryKey: [BADGES_QUERY_KEY],
    queryFn: getBadgesApi,
    staleTime: 1000 * 60 * 5,
  });
