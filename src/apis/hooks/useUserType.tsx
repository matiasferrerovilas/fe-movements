import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";
import type { UserTypeEnum } from "../../enums/UserTypeEnum";

interface ChangeUserTypeRequest {
  userType: UserTypeEnum;
}

/**
 * Hook para cambiar el tipo de usuario (PERSONAL/ENTERPRISE).
 * Solo disponible para usuarios con rol ADMIN.
 *
 * @returns Mutación que llama al endpoint PATCH /v1/users/me/type
 */
export const useChangeUserType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChangeUserTypeRequest) =>
      api.patch("/users/me/type", request).then((r) => r.data),
    onSuccess: () => {
      // Invalidar el cache del usuario actual para reflejar el cambio
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
};
