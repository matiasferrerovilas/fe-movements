import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markTourAsSeen } from "../tour/TourApi";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";
import type { CurrentUser } from "../../models/CurrentUser";

export const useMarkTourSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTourAsSeen,
    onSuccess: () => {
      queryClient.setQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY, (old) =>
        old ? { ...old, hasSeenTour: true } : old,
      );
    },
  });
};
